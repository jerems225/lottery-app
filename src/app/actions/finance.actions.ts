"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Authorization Helpers
async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");
    return session.user;
}

async function checkAgentOrAdmin() {
    const user = await checkAuth();
    if (user.role !== "AGENT" && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        throw new Error("Unauthorized. Requires Agent or Admin privileges.");
    }
    return user;
}

async function checkAdmin() {
    const user = await checkAuth();
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        throw new Error("Unauthorized. Requires Admin privileges.");
    }
    return user;
}

/**
 * 1. User Requests Deposit
 */
export async function requestDepositAction(data: { amount: number; paymentMethod: string; phoneNumber?: string }) {
    try {
        const user = await checkAuth();
        if (data.amount <= 0) return { error: "Amount must be greater than 0" };

        const request = await prisma.paymentRequest.create({
            data: {
                userId: user.id,
                type: "DEPOSIT",
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                phoneNumber: data.phoneNumber,
                status: "PENDING"
            }
        });

        // Notify Admins and Agents
        const managers = await prisma.user.findMany({
            where: { role: { in: ["AGENT", "ADMIN", "SUPERADMIN"] } }
        });

        for (const manager of managers) {
            await prisma.notification.create({
                data: {
                    userId: manager.id,
                    type: "RECHARGE",
                    title: "New Deposit Request",
                    message: `${user.name || user.email} requested a deposit of $${data.amount}`,
                    link: "/admin/finance" // or agent dashboard
                }
            });
        }

        revalidatePath("/profile");
        return { success: true, request };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * 2. User Requests Withdrawal
 */
export async function requestWithdrawalAction(data: { amount: number; paymentMethod: string; phoneNumber?: string }) {
    try {
        const user = await checkAuth();
        if (data.amount <= 0) return { error: "Amount must be greater than 0" };

        return await prisma.$transaction(async (tx) => {
            const dbUser = await tx.user.findUnique({ where: { id: user.id } });
            if (!dbUser || dbUser.balance < data.amount) {
                throw new Error("Insufficient balance");
            }

            // Deduct balance immediately
            await tx.user.update({
                where: { id: user.id },
                data: { balance: { decrement: data.amount } }
            });

            const request = await tx.paymentRequest.create({
                data: {
                    userId: user.id,
                    type: "WITHDRAWAL",
                    amount: data.amount,
                    paymentMethod: data.paymentMethod,
                    phoneNumber: data.phoneNumber,
                    status: "PENDING"
                }
            });

            // Log Transaction as pending output
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: "WITHDRAWAL",
                    amount: -data.amount,
                    status: "PENDING",
                    description: `Withdrawal request for $${data.amount}`
                }
            });

            revalidatePath("/profile");
            return { success: true, request };
        });
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * 3. Fetch All User Requests (Agent/Admin)
 */
export async function getAllUserRequestsAction() {
    try {
        await checkAgentOrAdmin();
        const requests = await prisma.paymentRequest.findMany({
            where: {
                type: { in: ["DEPOSIT", "WITHDRAWAL"] }
            },
            include: { user: { select: { name: true, email: true, id: true, balance: true, role: true } } },
            orderBy: [
                { status: "asc" }, // PENDING comes first usually alphabetically, or we can sort explicitly
                { createdAt: "desc" }
            ]
        });

        // Custom sort to explicitly put PENDING first
        const sorted = requests.sort((a: any, b: any) => {
            if (a.status === "PENDING" && b.status !== "PENDING") return -1;
            if (b.status === "PENDING" && a.status !== "PENDING") return 1;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });

        return { success: true, requests: sorted };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * 4. Process User Request (Agent/Admin)
 */
export async function processUserRequestAction(requestId: string, newStatus: "APPROVED" | "REJECTED") {
    try {
        const handler = await checkAgentOrAdmin();

        return await prisma.$transaction(async (tx) => {
            const request = await tx.paymentRequest.findUnique({ where: { id: requestId } });
            if (!request) throw new Error("Request not found");
            if (request.status !== "PENDING") throw new Error("Request is already processed");

            // Agent processing logic
            if (newStatus === "APPROVED") {
                if (request.type === "DEPOSIT") {
                    // Deduct balance from the Handler (Agent or Admin/Superadmin)
                    const handlerDb = await tx.user.findUnique({ where: { id: handler.id } });
                    if (!handlerDb || handlerDb.balance < request.amount) {
                        throw new Error(`Insufficient ${handler.role.toLowerCase()} balance to approve this deposit`);
                    }
                    await tx.user.update({
                        where: { id: handler.id },
                        data: { balance: { decrement: request.amount } }
                    });

                    // Add to User
                    await tx.user.update({
                        where: { id: request.userId },
                        data: { balance: { increment: request.amount } }
                    });

                    await tx.transaction.create({
                        data: {
                            userId: request.userId,
                            type: "DEPOSIT",
                            amount: request.amount,
                            status: "CONFIRMED",
                            description: `Deposit approved via ${request.paymentMethod || "Agent"}`
                        }
                    });
                } else if (request.type === "WITHDRAWAL") {
                    // Handler receives the digital balance in exchange for providing real cash
                    await tx.user.update({
                        where: { id: handler.id },
                        data: { balance: { increment: request.amount } }
                    });

                    // Confirm the user's pending transaction
                    await tx.transaction.updateMany({
                        where: { userId: request.userId, type: "WITHDRAWAL", status: "PENDING", amount: -request.amount },
                        data: { status: "CONFIRMED" } // Simplistic matching
                    });
                }
            } else if (newStatus === "REJECTED") {
                if (request.type === "WITHDRAWAL") {
                    // Refund to User
                    await tx.user.update({
                        where: { id: request.userId },
                        data: { balance: { increment: request.amount } }
                    });

                    // Mark related tx as rejected
                    await tx.transaction.updateMany({
                        where: { userId: request.userId, type: "WITHDRAWAL", status: "PENDING", amount: -request.amount },
                        data: { status: "REJECTED" }
                    });
                }
            }

            // Update Request Status
            await tx.paymentRequest.update({
                where: { id: requestId },
                data: {
                    status: newStatus,
                    handledById: handler.id
                }
            });

            // Notify User
            await tx.notification.create({
                data: {
                    userId: request.userId,
                    type: "RECHARGE",
                    title: `${request.type} ${newStatus}`,
                    message: `Your ${request.type.toLowerCase()} request for $${request.amount} has been ${newStatus.toLowerCase()}.`,
                    link: "/profile"
                }
            });

            revalidatePath("/admin/finance");
            revalidatePath("/profile");
            return { success: true };
        });
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * 5. Agent Requests Recharge from Admin
 */
export async function agentRequestRechargeAction(amount: number, proofUrl: string) {
    try {
        const agent = await checkAgentOrAdmin();
        if (amount <= 0) return { error: "Amount must be greater than 0" };

        const request = await prisma.paymentRequest.create({
            data: {
                userId: agent.id,
                type: "AGENT_RECHARGE",
                amount,
                proofUrl,
                status: "PENDING"
            }
        });

        // Notify Admins
        const admins = await prisma.user.findMany({
            where: { role: { in: ["ADMIN", "SUPERADMIN"] } }
        });

        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: "RECHARGE",
                    title: "Agent Recharge Request",
                    message: `Agent ${agent.name || agent.email} requested a recharge of $${amount}.`,
                    link: "/admin/finance"
                }
            });
        }

        revalidatePath("/admin/finance");
        return { success: true, request };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * 6. Admin Fetch All Agent Recharges
 */
export async function getAllAgentRechargeRequestsAction() {
    try {
        await checkAdmin();
        const requests = await prisma.paymentRequest.findMany({
            where: {
                type: "AGENT_RECHARGE"
            },
            include: { user: { select: { name: true, email: true, id: true, balance: true, role: true } } },
            orderBy: { createdAt: "desc" }
        });

        const sorted = requests.sort((a: any, b: any) => {
            if (a.status === "PENDING" && b.status !== "PENDING") return -1;
            if (b.status === "PENDING" && a.status !== "PENDING") return 1;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });

        return { success: true, requests: sorted };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * 7. Admin Process Agent Recharge
 */
export async function processAgentRechargeAction(requestId: string, newStatus: "APPROVED" | "REJECTED") {
    try {
        const admin = await checkAdmin();

        return await prisma.$transaction(async (tx) => {
            const request = await tx.paymentRequest.findUnique({ where: { id: requestId } });
            if (!request) throw new Error("Request not found");
            if (request.status !== "PENDING" || request.type !== "AGENT_RECHARGE") throw new Error("Invalid request");

            if (newStatus === "APPROVED") {
                const adminDb = await tx.user.findUnique({ where: { id: admin.id } });
                if (!adminDb || adminDb.balance < request.amount) {
                    throw new Error("Insufficient admin balance to approve this recharge");
                }

                // Deduct from Admin
                await tx.user.update({
                    where: { id: admin.id },
                    data: { balance: { decrement: request.amount } }
                });

                // Add to Agent Balance
                await tx.user.update({
                    where: { id: request.userId },
                    data: { balance: { increment: request.amount } }
                });

                await tx.transaction.create({
                    data: {
                        userId: request.userId,
                        type: "DEPOSIT",
                        amount: request.amount,
                        status: "CONFIRMED",
                        description: `Agent recharge approved by Admin`
                    }
                });
            }

            await tx.paymentRequest.update({
                where: { id: requestId },
                data: {
                    status: newStatus,
                    handledById: admin.id
                }
            });

            // Notify Agent
            await tx.notification.create({
                data: {
                    userId: request.userId,
                    type: "RECHARGE",
                    title: `Recharge ${newStatus}`,
                    message: `Your recharge request for $${request.amount} has been ${newStatus.toLowerCase()}.`,
                    link: "/admin/finance"
                }
            });

            revalidatePath("/admin/finance");
            return { success: true };
        });
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getUserPaymentRequestsAction() {
    try {
        const user = await checkAuth();
        const requests = await prisma.paymentRequest.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, requests };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function cancelPaymentRequestAction(requestId: string) {
    try {
        const user = await checkAuth();
        return await prisma.$transaction(async (tx) => {
            const request = await tx.paymentRequest.findUnique({ where: { id: requestId } });
            if (!request || request.userId !== user.id) throw new Error("Request not found");
            if (request.status !== "PENDING") throw new Error("Can only cancel pending requests");

            if (request.type === "WITHDRAWAL") {
                await tx.user.update({
                    where: { id: user.id },
                    data: { balance: { increment: request.amount } }
                });
            }

            await tx.paymentRequest.update({
                where: { id: requestId },
                data: { status: "CANCELLED" }
            });

            revalidatePath("/profile");
            return { success: true };
        });
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function searchAgentsAction(query: string) {
    try {
        await checkAdmin();
        const agents = await prisma.user.findMany({
            where: {
                role: "AGENT",
                OR: [
                    { email: { contains: query, mode: "insensitive" } },
                    { name: { contains: query, mode: "insensitive" } }
                ]
            },
            take: 10,
            select: { id: true, name: true, email: true, balance: true }
        });
        return { success: true, agents };
    } catch (err: any) { return { error: err.message }; }
}

export async function adminDirectRechargeAction(userId: string, amount: number) {
    try {
        const admin = await checkAdmin();
        if (amount <= 0) throw new Error("Invalid amount");
        return await prisma.$transaction(async (tx) => {
            const adminDb = await tx.user.findUnique({ where: { id: admin.id } });
            if (!adminDb || adminDb.balance < amount) {
                throw new Error("Insufficient admin balance for this direct recharge");
            }

            // Deduct from Admin
            await tx.user.update({
                where: { id: admin.id },
                data: { balance: { decrement: amount } }
            });

            await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } }
            });
            await tx.transaction.create({
                data: {
                    userId: userId,
                    type: "DEPOSIT",
                    amount: amount,
                    status: "CONFIRMED",
                    description: `Direct Recharge by Admin`
                }
            });
            await tx.paymentRequest.create({
                data: {
                    userId,
                    type: "AGENT_RECHARGE",
                    amount,
                    status: "APPROVED",
                    handledById: admin.id
                }
            });
            revalidatePath("/admin/finance");
            return { success: true };
        });
    } catch (err: any) { return { error: err.message }; }
}
