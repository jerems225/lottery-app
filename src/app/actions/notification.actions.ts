"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20
        });
        const unreadCount = await prisma.notification.count({
            where: { userId: session.user.id, isRead: false }
        });
        return { success: true, notifications, unreadCount };
    } catch (error) {
        return { success: false, error: "Failed to fetch notifications" };
    }
}

export async function markAsReadAction(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.notification.update({
            where: { id, userId: session.user.id },
            data: { isRead: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to mark as read" };
    }
}

export async function markAllAsReadAction() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, isRead: false },
            data: { isRead: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to mark all as read" };
    }
}
