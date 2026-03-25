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
    const [tickets, hostedRooms, referrals, winnings, commissions] = await Promise.all([
        prisma.bet.findMany({
            where: { userId },
            include: { lottery: true },
            orderBy: { createdAt: "desc" }
        }),
        prisma.lottery.findMany({
            where: { creatorId: userId },
            include: { _count: { select: { bets: true } } },
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
        })
    ]);

    // Build unified transaction history
    const outgoingTx = tickets.map((t: any) => ({
        id: t.id,
        type: "TICKET PURCHASE" as const,
        amount: -t.amount,
        date: t.createdAt,
        status: t.status,
        description: `Bought ${t.ticketsCount} ticket(s) for ${t.lottery.title}`
    }));

    const incomingTx = winnings.map((w: any) => ({
        id: w.id + "_win",
        type: "JACKPOT WIN" as const,
        amount: w.jackpot,
        date: w.updatedAt,
        status: "CONFIRMED",
        description: `Won the grand prize in ${w.title}`
    }));

    const commTx = commissions.map((c: any) => ({
        id: c.id,
        type: "COMMISSION" as const,
        amount: c.amount,
        date: c.createdAt,
        status: "CONFIRMED",
        description: `Affiliate commission from ${c.fromUser.name || "a friend"}`
    }));

    const transactions = [...outgoingTx, ...incomingTx, ...commTx]
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
        tickets,
        hostedRooms,
        referrals,
        transactions
    };
}
