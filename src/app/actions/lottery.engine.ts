"use server";
import { prisma } from "@/lib/prisma";

/**
 * Automatically resolve all expired lotteries.
 * - Builds a weighted ticket pool based on each bet's ticketsCount.
 * - Randomly draws a winner from the pool.
 * - Credits the winner's balance with the jackpot.
 * - Marks the lottery as COMPLETED.
 *
 * This runs lazily before any lottery list/buy action to ensure
 * the state is always fresh without needing a cron job.
 */
export async function resolveExpiredLotteries() {
    const expiredLotteries = await prisma.lottery.findMany({
        where: {
            status: "ACTIVE",
            endsAt: { lte: new Date() }
        },
        include: { bets: true }
    });

    for (const lottery of expiredLotteries) {
        let winnerId: string | null = null;

        if (lottery.bets.length > 0) {
            // Build weighted ticket pool
            const ticketsPool: string[] = [];
            lottery.bets.forEach((bet: any) => {
                for (let i = 0; i < bet.ticketsCount; i++) {
                    ticketsPool.push(bet.userId);
                }
            });

            // Random draw
            const winnerIndex = Math.floor(Math.random() * ticketsPool.length);
            winnerId = ticketsPool[winnerIndex];

            // Credit the winner
            await prisma.user.update({
                where: { id: winnerId },
                data: { balance: { increment: lottery.jackpot } }
            });
        }

        await prisma.lottery.update({
            where: { id: lottery.id },
            data: {
                status: "COMPLETED",
                winnerId,
            }
        });
    }
}
