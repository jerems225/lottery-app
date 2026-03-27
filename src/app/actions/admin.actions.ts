"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { sendBlockNotificationEmail, sendRoomClosedEmail } from "@/lib/mail";

/**
 * Level 1: MANAGER+ (Stats, Activity, Transactions)
 */
async function checkManager() {
    const session = await auth();
    const allowedRoles = ["MANAGER", "ADMIN", "SUPERADMIN"];
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
        throw new Error("Unauthorized: Manager access required");
    }
    return session;
}

/**
 * Level 2: ADMIN+ (User Management: edit/block)
 */
async function checkAdmin() {
    const session = await auth();
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

/**
 * Level 3: SUPERADMIN ONLY (Destructive: delete/promote staff)
 */
async function checkSuperAdmin() {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
        throw new Error("Unauthorized: Superadmin access required");
    }
    return session;
}

/**
 * Get Global Admin Stats
 */
export async function getAdminStatsAction() {
    try {
        const session = await checkManager();
        const role = session.user.role;

        // Hierarchical visibility permissions
        let allowedRoles: string[] = ["USER", "MANAGER"];
        if (role === "ADMIN") allowedRoles = ["USER", "MANAGER", "ADMIN"];
        if (role === "SUPERADMIN") allowedRoles = ["USER", "MANAGER", "ADMIN", "SUPERADMIN"];

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            newUsers24h,
            activeRooms,
            jackpotAggregate,
            totalVolumeAggregate,
            totalCommissionsAggregate,
            superAdminData,
            recentLiquidity
        ] = await Promise.all([
            prisma.user.count({ where: { role: { in: allowedRoles } } }),
            prisma.user.count({ where: { createdAt: { gte: yesterday }, role: { in: allowedRoles } } }),
            prisma.lottery.count({ where: { status: "ACTIVE" } }),
            prisma.lottery.aggregate({ _sum: { jackpot: true }, where: { status: "ACTIVE" } }),
            prisma.bet.aggregate({ _sum: { amount: true } }),
            prisma.commission.aggregate({ _sum: { amount: true } }),
            prisma.user.findFirst({ where: { role: "SUPERADMIN" }, select: { balance: true } }),
            prisma.transaction.findMany({
                where: { user: { role: "SUPERADMIN" } },
                take: 10,
                orderBy: { createdAt: "desc" }
            })
        ]);

        return {
            totalUsers,
            newUsers24h,
            activeRooms,
            jackpotTotal: jackpotAggregate._sum.jackpot || 0,
            totalVolume: totalVolumeAggregate._sum.amount || 0,
            totalCommissions: totalCommissionsAggregate._sum.amount || 0,
            reservePool: superAdminData?.balance || 0,
            liquidityMovements: recentLiquidity,
            success: true
        };
    } catch (error) {
        return { error: "Failed to fetch admin stats" };
    }
}

/**
 * Get Unified Activity Log (Live Feed)
 */
export async function getRecentActivityAction() {
    try {
        const session = await checkManager();
        const role = session.user.role;

        // Hierarchical visibility permissions
        let allowedRoles: string[] = ["USER", "MANAGER"];
        if (role === "ADMIN") allowedRoles = ["USER", "MANAGER", "ADMIN"];
        if (role === "SUPERADMIN") allowedRoles = ["USER", "MANAGER", "ADMIN", "SUPERADMIN"];

        const [users, transactions, commissions] = await Promise.all([
            prisma.user.findMany({
                where: { role: { in: allowedRoles } },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { name: true, createdAt: true }
            }),
            prisma.transaction.findMany({
                where: { user: { role: { in: allowedRoles } } },
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            prisma.commission.findMany({
                where: { user: { role: { in: allowedRoles } } },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            })
        ]);

        // Merge and sort by date
        const liveFeed = [
            ...users.map((u: any) => ({ type: 'USER', text: `New player joined: ${u.name}`, date: u.createdAt, user: u.name })),
            ...transactions.map((t: any) => ({ type: 'TX', text: t.description, date: t.createdAt, user: t.user.name, amount: t.amount })),
            ...commissions.map((c: any) => ({ type: 'COMMISSION', text: `Commission paid to ${c.user.name}`, date: c.createdAt, user: 'System', amount: c.amount }))
        ].sort((a: any, b: any) => (b.date as Date).getTime() - (a.date as Date).getTime()).slice(0, 10);

        return { liveFeed, success: true };
    } catch (error) {
        return { error: "Failed to fetch activity feed" };
    }
}


/**
 * Get All Users (Paginated)
 */
export async function getAllUsersAction() {
    try {
        const session = await checkManager();
        const role = session.user.role;

        // Hierarchical visibility permissions
        let allowedRoles: string[] = ["USER", "MANAGER"];
        if (role === "ADMIN") allowedRoles = ["USER", "MANAGER", "ADMIN"];
        if (role === "SUPERADMIN") allowedRoles = ["USER", "MANAGER", "ADMIN", "SUPERADMIN"];

        const users = await prisma.user.findMany({
            where: {
                role: { in: allowedRoles }
            },
            orderBy: { createdAt: "desc" },
            take: 100
        });
        return { users, success: true };
    } catch (error) {
        return { error: "Failed to fetch users" };
    }
}

/**
 * Create New User (Admin)
 */
export async function createNewUserAction(data: any) {
    try {
        await checkAdmin();

        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) return { error: "Email already registered" };

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role || "USER",
                balance: parseFloat(data.balance) || 0,
                isVerified: true
            }
        });

        revalidatePath("/admin/users");
        return { success: true, user };
    } catch (error) {
        return { error: "Failed to create user" };
    }
}

/**
 * Update User Details
 */
export async function updateUserDetailsAction(userId: string, data: any) {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        });

        const newBalance = parseFloat(data.balance) || 0;
        const balanceIncreased = currentUser && newBalance > currentUser.balance;

        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                balance: newBalance,
                isVerified: data.isVerified ?? true
            }
        });

        if (balanceIncreased) {
            await prisma.notification.create({
                data: {
                    userId: userId,
                    type: "RECHARGE",
                    title: "Wallet Credited",
                    message: `An administrator has added $${(newBalance - currentUser.balance).toFixed(2)} to your wallet.`,
                    link: "/profile"
                }
            });
        }

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update user" };
    }
}

/**
 * Delete User
 */
export async function deleteUserAction(userId: string) {
    try {
        const session = await checkSuperAdmin();

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role === "SUPERADMIN" && session.user.role !== "SUPERADMIN") {
            return { error: "Unauthorized to delete Superadmin" };
        }

        await prisma.user.delete({ where: { id: userId } });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete user. They might have related data." };
    }
}

/**
 * Block/Unblock User
 */
export async function toggleUserBlockAction(userId: string, blockedUntil: Date | null, reason: string | null, isTotalBlock: boolean = false) {
    try {
        await checkAdmin();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                blockedUntil,
                blockReason: reason,
                isTotalBlock
            }
        });

        // Add In-App Notification
        if (blockedUntil && new Date(blockedUntil) > new Date()) {
            await prisma.notification.create({
                data: {
                    userId: userId,
                    type: "ROOM_CLOSED", // Reusing ROOM_CLOSED style for system alerts
                    title: isTotalBlock ? "Account Revoked" : "Account Suspended",
                    message: `Reason: ${reason || "Policy violation"}. Ends: ${new Date(blockedUntil).toLocaleDateString()}`,
                    link: "/profile"
                }
            });
        }

        if (user?.email && blockedUntil && reason) {
            await sendBlockNotificationEmail(user.email, reason, blockedUntil, isTotalBlock);
        }

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to toggle restriction status" };
    }
}

/**
 * Get All Transactions
 */
export async function getAllTransactionsAction() {
    try {
        await checkManager();
        const transactions = await prisma.transaction.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, email: true } } },
            take: 100
        });
        return { transactions, success: true };
    } catch (error) {
        return { error: "Failed to fetch transactions" };
    }
}

/**
 * Get All Commissions
 */
export async function getCommissionsAction() {
    try {
        await checkManager();
        const commissions = await prisma.commission.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true } },
                fromUser: { select: { name: true } }
            },
            take: 100
        });
        return { commissions, success: true };
    } catch (error) {
        return { error: "Failed to fetch commissions" };
    }
}

/**
 * Update User Role
 */
export async function updateUserRoleAction(userId: string, newRole: string) {
    try {
        const session = await checkSuperAdmin();

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update role" };
    }
}

/**
 * Get All Lotteries (Admin)
 */
export async function getAllLotteriesAction(isPrivate: boolean = false) {
    try {
        await checkManager();
        const lotteries = await prisma.lottery.findMany({
            where: { isPrivate },
            orderBy: { createdAt: "desc" },
            include: {
                creator: { select: { name: true, email: true } },
                _count: { select: { bets: true } }
            }
        });
        return { lotteries, success: true };
    } catch (error) {
        return { error: "Failed to fetch lotteries" };
    }
}

/**
 * Create New Lottery (Admin - Public)
 */
export async function createLotteryAction(data: any) {
    try {
        const session = await checkAdmin();
        const lottery = await prisma.lottery.create({
            data: {
                title: data.title,
                description: data.description,
                price: parseFloat(data.price),
                maxTickets: parseInt(data.maxTickets),
                maxTicketsPerUser: parseInt(data.maxTicketsPerUser) || 50,
                endsAt: new Date(data.endsAt),
                isPrivate: false,
                jackpot: 0,
                creatorId: session.user.id,
                isAutoResolution: data.isAutoResolution ?? false
            }
        });
        revalidatePath("/admin/rooms");
        return { success: true, lottery };
    } catch (error) {
        return { error: "Failed to create lottery" };
    }
}

/**
 * Update Lottery (Admin)
 */
export async function updateLotteryAction(id: string, data: any) {
    try {
        await checkAdmin();
        const oldLottery = await prisma.lottery.findUnique({
            where: { id },
            select: { status: true, title: true }
        });

        await prisma.lottery.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                price: parseFloat(data.price),
                status: data.status,
                endsAt: new Date(data.endsAt),
                maxTickets: parseInt(data.maxTickets),
                isAutoResolution: data.isAutoResolution ?? false,
            }
        });

        // Notify participants if status changed to something critical (Suspended/Cancelled)
        if (oldLottery && oldLottery.status !== data.status && ["SUSPENDED", "CANCELLED"].includes(data.status)) {
            const bets = await prisma.bet.findMany({
                where: { lotteryId: id },
                select: { userId: true }
            });
            const userIds = Array.from(new Set(bets.map(b => b.userId)));

            for (const uid of userIds) {
                await prisma.notification.create({
                    data: {
                        userId: uid,
                        type: "ROOM_CLOSED",
                        title: `Room ${data.status.toLowerCase()}`,
                        message: `The room "${oldLottery.title}" has been ${data.status.toLowerCase()} by an administrator.`,
                        link: "/rooms"
                    }
                });
            }
        }

        revalidatePath("/admin/rooms");
        revalidatePath("/admin/private-rooms");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update lottery" };
    }
}

/**
 * Delete Lottery (Admin)
 */
export async function deleteLotteryAction(id: string) {
    try {
        await checkAdmin();
        // Check if there are bets
        const count = await prisma.bet.count({ where: { lotteryId: id } });
        if (count > 0) return { error: "Cannot delete lottery with existing bets" };

        await prisma.lottery.delete({ where: { id } });
        revalidatePath("/admin/rooms");
        revalidatePath("/admin/private-rooms");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete lottery" };
    }
}
/**
 * Resolve a lottery manually by picking a specific winner.
 */
export async function resolveLotteryManuallyAction(lotteryId: string, winnerUserId: string) {
    try {
        await checkAdmin();

        const lottery = await prisma.lottery.findUnique({
            where: { id: lotteryId },
            include: { bets: true }
        });

        if (!lottery || lottery.status !== "ACTIVE") {
            return { error: "Lottery not found or not active" };
        }

        if (lottery.isResolved) {
            return { error: "Lottery already resolved" };
        }

        // Must have at least 2 participants per spec
        if (lottery.bets.length < 2) {
            return { error: "Minimum 2 participants required for a draw" };
        }

        // Get the specific winning ticket for this user
        const winningTicket = await prisma.ticket.findFirst({
            where: { lotteryId, userId: winnerUserId }
        });

        if (!winningTicket) {
            return { error: "The chosen winner does not have a ticket in this room" };
        }

        const totalPot = lottery.jackpot;
        const winnerShare = totalPot * 0.75;
        const creatorShare = totalPot * 0.05;

        // Execute transactions
        await prisma.$transaction([
            // 1. Credit winner
            prisma.user.update({
                where: { id: winnerUserId },
                data: { balance: { increment: winnerShare } }
            }),
            prisma.transaction.create({
                data: {
                    userId: winnerUserId,
                    type: "JACKPOT WIN",
                    amount: winnerShare,
                    status: "CONFIRMED",
                    description: `MANUAL DRAW: Won 75% of prize in ${lottery.title}`
                }
            }),

            // 2. Credit creator
            ...(lottery.creatorId ? [
                prisma.user.update({
                    where: { id: lottery.creatorId },
                    data: { balance: { increment: creatorShare } }
                }),
                prisma.transaction.create({
                    data: {
                        userId: lottery.creatorId,
                        type: "CREATOR COMMISSION",
                        amount: creatorShare,
                        status: "CONFIRMED",
                        description: `MANUAL DRAW: 5% creator share from ${lottery.title}`
                    }
                })
            ] : []),

            // 3. Update Tickets
            prisma.ticket.update({
                where: { id: winningTicket.id },
                data: { status: "WINNER" }
            }),
            prisma.ticket.updateMany({
                where: { lotteryId, id: { not: winningTicket.id } },
                data: { status: "LOSER" }
            }),

            // 4. Update Lottery
            prisma.lottery.update({
                where: { id: lotteryId },
                data: {
                    status: "COMPLETED",
                    winnerId: winnerUserId,
                    isResolved: true
                }
            })
        ]);

        revalidatePath("/admin/rooms");
        revalidatePath("/admin/private-rooms");

        // 5. Send Notifications
        try {
            const participants = await prisma.ticket.findMany({
                where: { lotteryId },
                include: { user: true }
            });

            // Notify Winner
            const winner = participants.find(p => p.userId === winnerUserId)?.user;
            if (winner) {
                await prisma.notification.create({
                    data: {
                        userId: winner.id,
                        type: "WINNER_SELECTED",
                        title: "You Won!",
                        message: `Congratulations! You were selected as the winner of "${lottery.title}". Check your balance!`,
                        link: "/profile"
                    }
                });
            }

            // Notify others
            const participantIds = participants.map(p => p.userId);
            const others = Array.from(new Set(participantIds.filter(id => id !== winnerUserId)));

            for (const userId of others) {
                await prisma.notification.create({
                    data: {
                        userId: userId,
                        type: "ROOM_CLOSED",
                        title: "Draw Completed",
                        message: `The draw for "${lottery.title}" is over. A winner has been selected. Better luck next time!`,
                        link: "/rooms"
                    }
                });
            }
        } catch (error) {
            console.error("Manual Resolution Notification Error:", error);
        }

        return { success: true };
    } catch (error) {
        return { error: "Failed to resolve lottery manually" };
    }
}

/**
 * Get all participants (Tickets) for a lottery
 */
export async function getLotteryParticipantsAction(lotteryId: string) {
    try {
        await checkManager();
        const tickets = await prisma.ticket.findMany({
            where: { lotteryId },
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
            orderBy: { createdAt: "desc" }
        });

        // Group by user to show unique participants for manual selection
        const participants = tickets.reduce((acc: any[], current: any) => {
            if (!acc.find(p => p.id === current.user.id)) {
                acc.push(current.user);
            }
            return acc;
        }, []);

        return { success: true, participants };
    } catch (error) {
        return { error: "Failed to fetch participants" };
    }
}
