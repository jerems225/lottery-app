"use server";
import { prisma } from "@/lib/prisma";
import { sendRoomClosedEmail } from "@/lib/mail";

/**
 * Scan for expired lotteries that haven't notified anyone yet.
 * Sends emails and creates DB notifications for admins and participants.
 */
export async function notifyClosedLotteries() {
    const roomsToNotify = await prisma.lottery.findMany({
        where: {
            status: "ACTIVE",
            endsAt: { lte: new Date() },
            isClosedNotificationSent: false
        },
        include: {
            bets: { include: { user: true } }
        }
    });

    if (roomsToNotify.length === 0) return;

    // Get all admins to notify
    const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPERADMIN", "MANAGER"] } }
    });

    for (const room of roomsToNotify) {
        // 1. Notify Admins
        for (const admin of admins) {
            if (admin.email) {
                await sendRoomClosedEmail(admin.email, room.title, admin.role ?? "ADMIN", !room.isAutoResolution);
            }
            // Add DB notification
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: "ROOM_CLOSED",
                    title: !room.isAutoResolution ? "Manual Draw Required" : "Room Closed (Auto)",
                    message: !room.isAutoResolution
                        ? `The room "${room.title}" has closed. Please pick a winner manually.`
                        : `The room "${room.title}" has closed and is being processed automatically.`,
                    link: `/admin/rooms`
                }
            });
        }

        // 2. Notify Participants
        const participantIds = Array.from(new Set(room.bets.map(b => b.userId)));
        for (const userId of participantIds) {
            const bet = room.bets.find(b => b.userId === userId);
            if (bet?.user.email) {
                await sendRoomClosedEmail(bet.user.email, room.title, "USER", !room.isAutoResolution);
            }
            // Add DB notification
            await prisma.notification.create({
                data: {
                    userId: userId,
                    type: "ROOM_CLOSED",
                    title: "Room Closed",
                    message: `The room "${room.title}" you participated in has closed. Winner selection is in progress.`,
                    link: `/rooms`
                }
            });
        }

        // 3. Mark as notified
        await prisma.lottery.update({
            where: { id: room.id },
            data: { isClosedNotificationSent: true }
        });
    }
}

/**
 * Automatically resolve all expired lotteries.
 *
 * Revenue Distribution (per spec):
 *   🎟️ Winner:          75% of total pot
 *   👤 Room Creator:     5% of total pot
 *   🏢 Platform:        20% of total pot (retained, no payout)
 *
 * This runs lazily before any lottery list/buy action to ensure
 * the state is always fresh without needing a cron job.
 */
export async function resolveExpiredLotteries() {
    // Notify about closures first
    await notifyClosedLotteries();
    const expiredLotteries = await prisma.lottery.findMany({
        where: {
            status: "ACTIVE",
            endsAt: { lte: new Date() },
            isAutoResolution: true, // Only auto-process if enabled
            isResolved: false
        },
        include: { bets: true }
    });

    for (const lottery of expiredLotteries) {
        let winnerId: string | null = null;
        let finalStatus = "COMPLETED";

        // Check if we have at least 2 participants (bets) as per spec
        if (lottery.bets.length >= 2) {
            // Pick a winner from actual Ticket records
            const tickets = await prisma.ticket.findMany({
                where: { lotteryId: lottery.id }
            });

            if (tickets.length > 0) {
                const winnerIndex = Math.floor(Math.random() * tickets.length);
                const winningTicket = tickets[winnerIndex];
                winnerId = winningTicket.userId;

                const totalPot = lottery.jackpot;
                const winnerShare = totalPot * 0.75;       // 75% → Winner
                const creatorShare = totalPot * 0.05;      // 5%  → Room Creator

                // 1. Credit the Winner (75%)
                if (winnerId) {
                    await prisma.user.update({
                        where: { id: winnerId },
                        data: { balance: { increment: winnerShare } }
                    });

                    await prisma.transaction.create({
                        data: {
                            userId: winnerId,
                            type: "JACKPOT WIN",
                            amount: winnerShare,
                            status: "CONFIRMED",
                            description: `Won 75% of the prize pool in ${lottery.title}`
                        }
                    });

                    // Create Global Winner Notification for Confetti triggers
                    await prisma.notification.create({
                        data: {
                            userId: winnerId,
                            type: "JACKPOT_WIN",
                            title: `🎉 Jackpot Winner - ${lottery.title} 🎉`,
                            message: `You won ${winnerShare} from ${lottery.title}!`,
                            link: "/profile"
                        }
                    });
                }

                // 2. Credit the Room Creator (5%)
                if (lottery.creatorId) {
                    await prisma.user.update({
                        where: { id: lottery.creatorId },
                        data: { balance: { increment: creatorShare } }
                    });

                    await prisma.transaction.create({
                        data: {
                            userId: lottery.creatorId,
                            type: "CREATOR COMMISSION",
                            amount: creatorShare,
                            status: "CONFIRMED",
                            description: `5% creator share from ${lottery.title}`
                        }
                    });
                }

                // 3. Platform keeps 20%

                // Update tickets
                await prisma.ticket.update({
                    where: { id: winningTicket.id },
                    data: { status: "WINNER" }
                });

                await prisma.ticket.updateMany({
                    where: {
                        lotteryId: lottery.id,
                        id: { not: winningTicket.id }
                    },
                    data: { status: "LOSER" }
                });
            }
        } else if (lottery.bets.length > 0) {
            // NOT ENOUGH PARTICIPANTS (Min 2)
            // CANCEL and REFUND
            finalStatus = "CANCELLED";

            for (const bet of lottery.bets) {
                await prisma.user.update({
                    where: { id: bet.userId },
                    data: { balance: { increment: bet.amount } }
                });

                await prisma.transaction.create({
                    data: {
                        userId: bet.userId,
                        type: "REFUND",
                        amount: bet.amount,
                        status: "CONFIRMED",
                        description: `Refund for cancelled room ${lottery.title} (Reason: Min. 2 players not reached)`
                    }
                });
            }

            await prisma.ticket.updateMany({
                where: { lotteryId: lottery.id },
                data: { status: "CANCELLED" }
            });
        } else {
            // No bets at all, just complete (or cancel)
            finalStatus = "COMPLETED";
        }

        await prisma.lottery.update({
            where: { id: lottery.id },
            data: {
                status: finalStatus,
                winnerId,
                isResolved: true
            }
        });
    }
}
