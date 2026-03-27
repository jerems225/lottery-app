"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Fetch all dashboard data for the authenticated user.
 *
 * Returns:
 *  - tickets: all bets placed by the user (with lottery details)
 *  - hostedRooms: all lotteries created by the user
 *  - referrals: all users referred by the user
 *  - transactions: merged & sorted list of ticket purchases and jackpot wins
 */
export async function getUserDashboardDataAction() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    const userId = session.user.id;

    // Parallel queries for performance
    const [user, bets, tickets, hostedRooms, referrals, winnings, commissions, transactions] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                balance: true,
                image: true,
                isVerified: true,
                role: true,
                blockedUntil: true,
                blockReason: true,
                isTotalBlock: true,
                createdAt: true
            }
        }),
        prisma.bet.findMany({
            where: { userId },
            include: { lottery: true },
            orderBy: { createdAt: "desc" }
        }),
        prisma.ticket.findMany({
            where: { userId },
            include: { lottery: true },
            orderBy: { createdAt: "desc" }
        }),
        prisma.lottery.findMany({
            where: { creatorId: userId },
            include: {
                _count: { select: { bets: true } },
                bets: {
                    include: { user: true }
                }
            },
            orderBy: { createdAt: "desc" }
        }),
        prisma.user.findMany({
            where: { referredById: userId },
            orderBy: { createdAt: "desc" }
        }),
        prisma.lottery.findMany({
            where: { winnerId: userId },
            orderBy: { endsAt: "desc" }
        }),
        prisma.commission.findMany({
            where: { userId },
            include: { fromUser: true },
            orderBy: { createdAt: "desc" }
        }),
        prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        })
    ]);

    // Unified transaction history is now in the DB
    // `transactions` already pulled from parallel queries


    return {
        user,
        tickets,
        hostedRooms,
        referrals,
        transactions
    };
}
