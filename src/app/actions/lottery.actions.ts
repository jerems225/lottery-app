"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { resolveExpiredLotteries } from "./lottery.engine";

/**
 * Helper to check if a user is restricted (suspended or blocked)
 */
async function checkUserRestriction(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { blockedUntil: true, isTotalBlock: true }
    });

    if (user?.blockedUntil && new Date(user.blockedUntil) > new Date()) {
        return {
            isRestricted: true,
            error: user.isTotalBlock
                ? "Your account access has been fully revoked. Please contact support."
                : "Your account is currently suspended. Access to betting and recharge is disabled."
        };
    }
    return { isRestricted: false };
}

/**
 * Fetch all lottery rooms (public + private) from the database.
 * Resolves any expired lotteries before returning results.
 * Includes the winner's name for completed rooms.
 */
export async function getActiveRoomsAction() {
    try {
        await resolveExpiredLotteries();
    } catch (err) {
        console.error("Delayed draw resolution error (non-fatal):", err);
    }

    try {
        const rooms = await prisma.lottery.findMany({
        orderBy: { endsAt: "asc" },
        include: {
            _count: { select: { bets: true } },
            creator: { select: { name: true } }
        }
    });

    // Attach winner names for completed rooms in bulk to avoid N+1 queries
    const winnerIds = Array.from(new Set(rooms.map(r => r.winnerId).filter(Boolean))) as string[];
    const winners = winnerIds.length > 0 
        ? await prisma.user.findMany({
            where: { id: { in: winnerIds } },
            select: { id: true, name: true }
          })
        : [];
    
    // Create a lookup map
    const winnerMap = Object.fromEntries(winners.map(w => [w.id, w.name]));

    const roomsWithWinner = rooms.map(room => ({
        ...room,
        winnerName: room.winnerId ? (winnerMap[room.winnerId] || "Anonymous") : null
    }));

    return roomsWithWinner;
    } catch (error) {
        console.error("Room fetch error:", error);
        return [];
    }
}

// Minimum wallet balance required to create a private room (in USD)
const MIN_BALANCE_TO_CREATE_ROOM = 10;

/**
 * Create a new private lottery room.
 * 
 * Requirements:
 *  - User must be authenticated.
 *  - User must have at least $80 in wallet balance.
 *  - Duration (countdown) is chosen at creation: 30min, 1h, 2h, 3h, 5h.
 *  - Returns the created room for immediate UI display.
 */
export async function createPrivateRoomAction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    // Validate inputs
    const title = (formData.get("title") as string) || "Custom Community Room";
    const betAmount = parseFloat(formData.get("bet_amount") as string);
    const maxTickets = parseInt(formData.get("max_tickets") as string);
    const durationMinutes = parseInt(formData.get("duration_minutes") as string);

    if (isNaN(betAmount) || betAmount <= 0) return { error: "Invalid ticket price" };
    if (isNaN(maxTickets) || maxTickets < 2) return { error: "Minimum 2 tickets required" };
    if (isNaN(durationMinutes) || durationMinutes <= 0) return { error: "Invalid duration" };

    try {
        const restriction = await checkUserRestriction(session.user.id);
        if (restriction.isRestricted) return { error: restriction.error };

        // Check wallet balance
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) return { error: "User not found" };

        if (!user.isVerified) {
            return { error: "You must verify your email to create a room.", errorCode: "UNVERIFIED" };
        }

        if (user.balance < MIN_BALANCE_TO_CREATE_ROOM) {
            return {
                error: `You need at least $${MIN_BALANCE_TO_CREATE_ROOM} in your wallet to create a room.`,
                errorCode: "INSUFFICIENT_FUNDS"
            };
        }

        const room = await prisma.lottery.create({
            data: {
                title,
                price: betAmount,
                jackpot: 0,
                endsAt: new Date(Date.now() + durationMinutes * 60 * 1000),
                isPrivate: true,
                maxTickets,
                maxTicketsPerUser: 1,
                creatorId: session.user.id,
            }
        });

        // Notify Creator
        await prisma.notification.create({
            data: {
                userId: session.user.id,
                type: "RECHARGE", // Confirmation style
                title: "Room Created!",
                message: `Your private room "${title}" is live. Share it with your friends!`,
                link: `/rooms/${room.id}`
            }
        });

        // Notify Admins
        const admins = await prisma.user.findMany({
            where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
            select: { id: true }
        });

        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: "ROOM_CLOSED", // ACTIVITY style
                    title: "New Private Room",
                    message: `User ${session.user.name || "A user"} just created a new room: "${title}".`,
                    link: "/admin/private-rooms"
                }
            });
        }

        revalidatePath("/rooms");
        return { success: true, room };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Buy tickets for a specific lottery room.
 *
 * Business rules enforced:
 *  1. User must be authenticated.
 *  2. Lottery must be ACTIVE and not expired.
 *  3. User's wallet balance must cover the total cost.
 *  4. Room's global ticket limit must not be exceeded.
 *  5. User's per-room ticket limit must not be exceeded.
 *
 * Uses a Prisma transaction to prevent race conditions.
 */
export async function buyTicketsAction(roomId: string, ticketsToBuy: number) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };
    if (ticketsToBuy <= 0) return { error: "Invalid ticket amount" };

    try {
        const restriction = await checkUserRestriction(session.user.id);
        if (restriction.isRestricted) return { error: restriction.error };

        await resolveExpiredLotteries();

        return await prisma.$transaction(async (tx: any) => {
            const lottery = await tx.lottery.findUnique({
                where: { id: roomId },
                include: { bets: { where: { userId: session.user!.id } } }
            });

            if (!lottery) return { error: "Lottery not found" };
            if (lottery.status !== "ACTIVE" || new Date() > lottery.endsAt) {
                return { error: "Lottery is already closed" };
            }

            const totalCost = lottery.price * ticketsToBuy;
            const user = await tx.user.findUnique({ where: { id: session.user!.id } });
            if (!user) return { error: "User not found" };

            if (!user.isVerified) {
                return { error: "You must verify your email to participate.", errorCode: "UNVERIFIED" };
            }

            // 0. Creator check
            if (lottery.creatorId === user.id) {
                return { error: "You cannot buy tickets for your own room." };
            }

            // 1. Wallet balance check
            if (user.balance < totalCost) {
                return { error: "Insufficient wallet balance", errorCode: "INSUFFICIENT_FUNDS" };
            }

            // 2. Room max tickets check
            if (lottery.currentTicketCount + ticketsToBuy > lottery.maxTickets) {
                return { error: "Exceeds maximum tickets available for this room" };
            }

            // 3. Per-user max tickets check
            const userTotalOwned = lottery.bets.reduce(
                (acc: number, bet: any) => acc + bet.ticketsCount, 0
            );
            if (userTotalOwned + ticketsToBuy > lottery.maxTicketsPerUser) {
                return { error: `You can only buy up to ${lottery.maxTicketsPerUser} tickets for this room` };
            }

            // Record the bet
            const bet = await tx.bet.create({
                data: {
                    userId: user.id,
                    lotteryId: lottery.id,
                    amount: totalCost,
                    ticketsCount: ticketsToBuy,
                    status: "CONFIRMED"
                }
            });

            // Generate ticket references
            const generateTicketReference = () => {
                const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
                const timePart = Date.now().toString().slice(-4);
                return `TKT-${randomPart}-${timePart}`;
            };

            const ticketsData = Array.from({ length: ticketsToBuy }).map(() => ({
                reference: generateTicketReference(),
                userId: user.id,
                lotteryId: lottery.id,
                betId: bet.id,
                status: "PENDING"
            }));

            await tx.ticket.createMany({
                data: ticketsData
            });

            // Deduct balance from buyer
            await tx.user.update({
                where: { id: user.id },
                data: { balance: { decrement: totalCost } }
            });

            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: "TICKET PURCHASE",
                    amount: -totalCost,
                    status: "CONFIRMED",
                    description: `Bought ${ticketsToBuy} ticket(s) for ${lottery.title}`
                }
            });

            // Notify Buyer
            await tx.notification.create({
                data: {
                    userId: user.id,
                    type: "RECHARGE",
                    title: "Tickets Purchased",
                    message: `You bought ${ticketsToBuy} tickets for "${lottery.title}". Good luck!`,
                    link: "/profile"
                }
            });

            // Handle Affiliate Commission (2% of total bet per spec)
            // Spec: Platform takes 20% fees, affiliator gets 10% of those fees = 2% of bet
            if (user.referredById) {
                const commissionAmount = totalCost * 0.02;
                await tx.user.update({
                    where: { id: user.referredById },
                    data: { balance: { increment: commissionAmount } }
                });

                await tx.commission.create({
                    data: {
                        amount: commissionAmount,
                        userId: user.referredById,
                        fromUserId: user.id,
                        betId: bet.id
                    }
                });

                await tx.transaction.create({
                    data: {
                        userId: user.referredById,
                        type: "COMMISSION",
                        amount: commissionAmount,
                        status: "CONFIRMED",
                        description: `Affiliate commission from new bet by ${user.name || "friend"}`
                    }
                });

                // Notify Affiliate
                await tx.notification.create({
                    data: {
                        userId: user.referredById,
                        type: "RECHARGE",
                        title: "Commission Received!",
                        message: `You earned $${commissionAmount.toFixed(2)} from ${user.name || "a friend"}'s bet!`,
                        link: "/profile"
                    }
                });
            }

            // Update room: increment ticket count + full pot (jackpot = total bets)
            // Distribution happens at draw time: Winner 75%, Creator 5%, Platform 20%
            await tx.lottery.update({
                where: { id: lottery.id },
                data: {
                    currentTicketCount: { increment: ticketsToBuy },
                    jackpot: { increment: totalCost }
                }
            });

            // Notify Room Creator (if not public room or if creator is present)
            if (lottery.creatorId) {
                await tx.notification.create({
                    data: {
                        userId: lottery.creatorId,
                        type: "ROOM_CLOSED", // ACTIVITY style
                        title: "New Participant",
                        message: `Someone just bought tickets in your room "${lottery.title}"!`,
                        link: `/admin/private-rooms`
                    }
                });
            }

            revalidatePath("/rooms");
            revalidatePath("/profile");

            return { success: true };
        });
    } catch (error: any) {
        return { error: error.message || "An unexpected error occurred." };
    }
}

/**
 * Update an existing private room.
 * Only the creator can update it, and ONLY if NO tickets have been sold.
 */
export async function updatePrivateRoomAction(roomId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    const title = formData.get("title") as string;
    const betAmount = parseFloat(formData.get("bet_amount") as string);
    const maxTickets = parseInt(formData.get("max_tickets") as string);
    const durationMinutes = parseInt(formData.get("duration_minutes") as string);

    if (!title || isNaN(betAmount) || isNaN(maxTickets) || isNaN(durationMinutes)) {
        return { error: "Invalid form data" };
    }

    try {
        const room = await prisma.lottery.findUnique({ where: { id: roomId } });
        if (!room) return { error: "Room not found" };

        if (room.creatorId !== session.user.id) {
            return { error: "Unauthorized. You do not own this room." };
        }

        if (room.currentTicketCount > 0) {
            return { error: "Cannot modify room after tickets have been sold." };
        }

        const updatedRoom = await prisma.lottery.update({
            where: { id: roomId },
            data: {
                title,
                price: betAmount,
                maxTickets,
                maxTicketsPerUser: 1,
                endsAt: new Date(room.createdAt.getTime() + durationMinutes * 60 * 1000)
            }
        });

        revalidatePath("/profile");
        revalidatePath("/rooms");
        revalidatePath(`/rooms/${roomId}`);

        return { success: true, room: updatedRoom };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Delete a private room.
 * Only the creator can delete it, and ONLY if NO tickets have been sold.
 */
export async function deletePrivateRoomAction(roomId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        const room = await prisma.lottery.findUnique({ where: { id: roomId } });
        if (!room) return { error: "Room not found" };

        if (room.creatorId !== session.user.id) {
            return { error: "Unauthorized. You do not own this room." };
        }

        if (room.currentTicketCount > 0) {
            return { error: "Cannot delete room after tickets have been sold." };
        }

        await prisma.lottery.delete({ where: { id: roomId } });

        revalidatePath("/profile");
        revalidatePath("/rooms");

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Search/filter private rooms for the authenticated user.
 */
export async function searchUserRoomsAction(query: string = "") {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        const rooms = await prisma.lottery.findMany({
            where: {
                creatorId: session.user.id,
                title: { contains: query, mode: "insensitive" }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, rooms };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Fetch the latest 5 ticket purchases globally for the live animated feed.
 */
export async function getLiveTicketsAction() {
    try {
        const bets = await prisma.bet.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                user: { select: { name: true } },
                lottery: { select: { title: true } }
            }
        });

        return {
            success: true,
            tickets: bets.map((b: any) => ({
                id: b.id,
                userName: b.user?.name || "Anonymous",
                roomName: b.lottery?.title || "Unknown Room",
                ticketsCount: b.ticketsCount,
                createdAt: b.createdAt
            }))
        };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Check if the user has any unread JACKPOT_WIN notifications, returns them,
 * and immediately marks as read so they only celebrate once.
 */
export async function getAndClearWinNotificationsAction() {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        const unreadWins = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                type: "JACKPOT_WIN",
                isRead: false
            }
        });

        if (unreadWins.length > 0) {
            // Mark as read
            await prisma.notification.updateMany({
                where: {
                    id: { in: unreadWins.map((n: any) => n.id) }
                },
                data: { isRead: true }
            });

            return { success: true, wins: unreadWins };
        }

        return { success: true, wins: [] };
    } catch (error: any) {
        return { error: error.message };
    }
}
