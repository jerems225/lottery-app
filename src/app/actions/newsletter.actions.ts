"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sendNewsletterEmail } from "@/lib/mail";

/**
 * Subscribe an email to the newsletter.
 */
export async function subscribeToNewsletterAction(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email || !email.includes("@")) {
        return { error: "Please provide a valid email address." };
    }

    try {
        const existing = await prisma.newsletter.findUnique({
            where: { email }
        });

        if (existing) {
            if (existing.isActive) {
                return { success: true, message: "You are already subscribed!" };
            } else {
                await prisma.newsletter.update({
                    where: { email },
                    data: { isActive: true }
                });
                return { success: true, message: "Welcome back! Subscription reactivated." };
            }
        }

        await prisma.newsletter.create({
            data: { email }
        });

        return { success: true, message: "🎉 Welcome to the BitLOT family! Your subscription is confirmed." };
    } catch (error) {
        console.error("Newsletter Sub Error:", error);
        return { error: "Something went wrong. Please try again later." };
    }
}

/**
 * Get all newsletter subscribers (Admin Only).
 */
export async function getSubscribersAction() {
    const session = await auth();
    if (!session || !["ADMIN", "SUPERADMIN", "MANAGER"].includes(session.user?.role || "")) {
        return { error: "Unauthorized access." };
    }

    try {
        const subscribers = await prisma.newsletter.findMany({
            orderBy: { createdAt: "desc" }
        });
        return { success: true, subscribers };
    } catch (error) {
        return { error: "Failed to fetch subscribers." };
    }
}

/**
 * Toggle subscriber active status.
 */
export async function toggleSubscriberStatusAction(id: string) {
    const session = await auth();
    if (!session || !["ADMIN", "SUPERADMIN", "MANAGER"].includes(session.user?.role || "")) {
        return { error: "Unauthorized access." };
    }

    try {
        const sub = await prisma.newsletter.findUnique({ where: { id } });
        if (!sub) return { error: "Subscriber not found." };

        await prisma.newsletter.update({
            where: { id },
            data: { isActive: !sub.isActive }
        });
        return { success: true };
    } catch (error) {
        return { error: "Failed to update subscriber." };
    }
}

/**
 * Send bulk email to all active newsletter subscribers.
 */
export async function sendBulkEmailAction(subject: string, content: string) {
    const session = await auth();
    if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role || "")) {
        return { error: "Unauthorized." };
    }

    try {
        const subscribers = await prisma.newsletter.findMany({
            where: { isActive: true },
            select: { email: true }
        });

        // Loop and send (ideally use a queue for thousands of users)
        for (const sub of subscribers) {
            await sendNewsletterEmail(sub.email, subject, content);
        }

        return { success: true, count: subscribers.length };
    } catch (error) {
        return { error: "Failed to send bulk emails." };
    }
}

/**
 * Send targeted notifications to users.
 */
export async function sendTargetedNotificationAction(criteria: any, title: string, message: string) {
    const session = await auth();
    if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role || "")) {
        return { error: "Unauthorized." };
    }

    try {
        const where: any = {};
        if (criteria.minBalance) where.balance = { gte: parseFloat(criteria.minBalance) };
        if (criteria.role) where.role = criteria.role;
        if (criteria.isVerified === "true") where.isVerified = true;
        if (criteria.isVerified === "false") where.isVerified = false;

        const users = await prisma.user.findMany({ where, select: { id: true } });

        if (users.length === 0) return { success: true, count: 0 };

        await prisma.notification.createMany({
            data: users.map(u => ({
                userId: u.id,
                title,
                message,
                type: "ANNOUNCEMENT", // Explicit type for bulk news
            }))
        });

        return { success: true, count: users.length };
    } catch (error) {
        console.error("Targeted Notif Error:", error);
        return { error: "Failed to send targeted notifications." };
    }
}
