"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { resolveExpiredLotteries } from "./lottery.engine";

/**
 * Fetch all lottery rooms (public + private) from the database.
 * Resolves any expired lotteries before returning results.
 * Includes the winner's name for completed rooms.
 */
export async function getActiveRoomsAction() {
    await resolveExpiredLotteries();

    const rooms = await prisma.lottery.findMany({
        orderBy: { endsAt: "asc" },
        include: {
            _count: { select: { bets: true } },
            creator: { select: { name: true } }
        }
    });

    // Attach winner name for completed rooms
    const roomsWithWinner = await Promise.all(
        rooms.map(async (room: any) => {
            let winnerName: string | null = null;
            if (room.winnerId) {
                const winner = await prisma.user.findUnique({
                    where: { id: room.winnerId },
                    select: { name: true }
                });
                winnerName = winner?.name || "Anonymous";
            }
            return { ...room, winnerName };
        })
    );

    return roomsWithWinner;
}

// Minimum wallet balance required to create a private room (in USD)
const MIN_BALANCE_TO_CREATE_ROOM = 80;

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
                maxTicketsPerUser: Math.min(10, maxTickets),
                creatorId: session.user.id,
            }
        });

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

            // Deduct balance from buyer
            await tx.user.update({
                where: { id: user.id },
                data: { balance: { decrement: totalCost } }
            });

            // Handle Affiliate Commission (2% of bet)
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
            }

            // Update room: increment ticket count + jackpot (80% of sales)
            // Note: 80% goes to Jackpot, 2% goes to Affiliate, 18% goes to Platform
            await tx.lottery.update({
                where: { id: lottery.id },
                data: {
                    currentTicketCount: { increment: ticketsToBuy },
                    jackpot: { increment: totalCost * 0.8 }
                }
            });

            revalidatePath("/rooms");
            revalidatePath("/profile");

            return { success: true };
        });
    } catch (error: any) {
        return { error: error.message || "An unexpected error occurred." };
    }
}
