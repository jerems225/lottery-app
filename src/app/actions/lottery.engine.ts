"use server";
import { prisma } from "@/lib/prisma";
import { sendRoomClosedEmail } from "@/lib/mail";

/**
 * Scan for expired lotteries that haven't notified anyone yet.
 * Sends emails and creates DB notifications for admins and participants.
 * Optimized: Fetches admins once, sends emails in parallel.
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

    // Get all admins once to avoid redundant DB hits in the loop
    const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPERADMIN", "MANAGER"] } },
        select: { id: true, email: true, role: true }
    });

    const emailPromises: Promise<any>[] = [];
    const notificationData: any[] = [];

    for (const room of roomsToNotify) {
        // 1. Prepare Admin Notifications
        for (const admin of admins) {
            if (admin.email) {
                emailPromises.push(sendRoomClosedEmail(admin.email, room.title, admin.role ?? "ADMIN", !room.isAutoResolution));
            }
            notificationData.push({
                userId: admin.id,
                type: "ROOM_CLOSED",
                title: !room.isAutoResolution ? "Manual Draw Required" : "Room Closed (Auto)",
                message: !room.isAutoResolution
                    ? `The room "${room.title}" has closed. Please pick a winner manually.`
                    : `The room "${room.title}" has closed and is being processed automatically.`,
                link: `/admin/rooms`
            });
        }

        // 2. Prepare Participant Notifications
        const participantIds = Array.from(new Set(room.bets.map(b => b.userId)));
        for (const userId of participantIds) {
            const bet = room.bets.find(b => b.userId === userId);
            if (bet?.user.email) {
                emailPromises.push(sendRoomClosedEmail(bet.user.email, room.title, "USER", !room.isAutoResolution));
            }
            notificationData.push({
                userId: userId,
                type: "ROOM_CLOSED",
                title: "Room Closed",
                message: `The room "${room.title}" you participated in has closed. Winner selection is in progress.`,
                link: `/rooms`
            });
        }
    }

    // Execute notifications in bulk
    try {
        if (notificationData.length > 0) {
            await prisma.notification.createMany({ data: notificationData });
        }
        
        // Wait for all emails in parallel
        await Promise.allSettled(emailPromises);

        // Bulk mark as notified
        await prisma.lottery.updateMany({
            where: { id: { in: roomsToNotify.map(r => r.id) } },
            data: { isClosedNotificationSent: true }
        });
    } catch (err) {
        console.error("Bulk notification error:", err);
    }
}

/**
 * Automatically resolve all expired lotteries.
 * Optimized: Rate-limited to run at most once every 60 seconds.
 */
export async function resolveExpiredLotteries() {
    // 1. Rate Limiting Check
    const now = new Date();
    const SIXTY_SECONDS = 60 * 1000;

    try {
        const lastRun = await prisma.globalSetting.findUnique({
            where: { key: "last_resolution_run" }
        });

        if (lastRun && (now.getTime() - new Date(lastRun.value).getTime() < SIXTY_SECONDS)) {
            return;
        }

        await prisma.globalSetting.upsert({
            where: { key: "last_resolution_run" },
            update: { value: now.toISOString() },
            create: { key: "last_resolution_run", value: now.toISOString() }
        });
    } catch (err) {
        console.error("Rate limit check error:", err);
    }

    // Notify about closures first
    await notifyClosedLotteries();

    const expiredLotteries = await prisma.lottery.findMany({
        where: {
            status: "ACTIVE",
            endsAt: { lte: now },
            isAutoResolution: true,
            isResolved: false
        },
        include: { bets: true }
    });

    if (expiredLotteries.length === 0) return;

    for (const lottery of expiredLotteries) {
        try {
            await prisma.$transaction(async (tx) => {
                let winnerId: string | null = null;
                let finalStatus = "COMPLETED";

                if (lottery.bets.length >= 2) {
                    const tickets = await tx.ticket.findMany({
                        where: { lotteryId: lottery.id }
                    });

                    if (tickets.length > 0) {
                        const winnerIndex = Math.floor(Math.random() * tickets.length);
                        const winningTicket = tickets[winnerIndex];
                        winnerId = winningTicket.userId;

                        const totalPot = lottery.jackpot;
                        const winnerShare = totalPot * 0.75;
                        const creatorShare = totalPot * 0.05;

                        // 1. Credit Winner
                        await tx.user.update({
                            where: { id: winnerId },
                            data: { balance: { increment: winnerShare } }
                        });

                        await tx.transaction.create({
                            data: {
                                userId: winnerId,
                                type: "JACKPOT WIN",
                                amount: winnerShare,
                                status: "CONFIRMED",
                                description: `Won 75% of prize in ${lottery.title}`
                            }
                        });

                        await tx.notification.create({
                            data: {
                                userId: winnerId,
                                type: "JACKPOT_WIN",
                                title: `🎉 Winner - ${lottery.title} 🎉`,
                                message: `You won ${winnerShare} from ${lottery.title}!`,
                                link: "/profile"
                            }
                        });

                        // 2. Credit Creator
                        if (lottery.creatorId) {
                            await tx.user.update({
                                where: { id: lottery.creatorId },
                                data: { balance: { increment: creatorShare } }
                            });

                            await tx.transaction.create({
                                data: {
                                    userId: lottery.creatorId,
                                    type: "CREATOR COMMISSION",
                                    amount: creatorShare,
                                    status: "CONFIRMED",
                                    description: `5% creator share from ${lottery.title}`
                                }
                            });
                        }

                        // Update tickets
                        await tx.ticket.update({
                            where: { id: winningTicket.id },
                            data: { status: "WINNER" }
                        });

                        await tx.ticket.updateMany({
                            where: { lotteryId: lottery.id, id: { not: winningTicket.id } },
                            data: { status: "LOSER" }
                        });
                    }
                } else if (lottery.bets.length > 0) {
                    finalStatus = "CANCELLED";
                    for (const bet of lottery.bets) {
                        await tx.user.update({
                            where: { id: bet.userId },
                            data: { balance: { increment: bet.amount } }
                        });

                        await tx.transaction.create({
                            data: {
                                userId: bet.userId,
                                type: "REFUND",
                                amount: bet.amount,
                                status: "CONFIRMED",
                                description: `Refund for ${lottery.title}`
                            }
                        });
                    }
                    await tx.ticket.updateMany({
                        where: { lotteryId: lottery.id },
                        data: { status: "CANCELLED" }
                    });
                }

                await tx.lottery.update({
                    where: { id: lottery.id },
                    data: {
                        status: finalStatus,
                        winnerId,
                        isResolved: true
                    }
                });
            });
        } catch (e) {
            console.error(`Error resolving lottery ${lottery.id}:`, e);
        }
    }
}
