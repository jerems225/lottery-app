"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFaqsAction() {
    try {
        const faqs = await prisma.faq.findMany({
            orderBy: { order: "asc" }
        });
        return { success: true, faqs };
    } catch (error) {
        return { success: false, error: "Failed to fetch FAQs" };
    }
}

export async function createFaqAction(data: { category: string, question: string, answer: string, icon?: string, order?: number }) {
    try {
        const faq = await prisma.faq.create({
            data: {
                category: data.category,
                question: data.question,
                answer: data.answer,
                icon: data.icon || "HelpCircle",
                order: data.order || 0
            }
        });
        revalidatePath("/faq");
        return { success: true, faq };
    } catch (error) {
        return { success: false, error: "Failed to create FAQ" };
    }
}

export async function updateFaqAction(id: string, data: any) {
    try {
        const faq = await prisma.faq.update({
            where: { id },
            data
        });
        revalidatePath("/faq");
        return { success: true, faq };
    } catch (error) {
        return { success: false, error: "Failed to update FAQ" };
    }
}

export async function deleteFaqAction(id: string) {
    try {
        await prisma.faq.delete({
            where: { id }
        });
        revalidatePath("/faq");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete FAQ" };
    }
}

export async function seedFaqsAction(faqs: any[]) {
    try {
        // Check if we already have faqs
        const count = await prisma.faq.count();
        if (count > 0) return { success: true, message: "Already seeded" };

        for (const item of faqs) {
            for (const q of item.questions) {
                await prisma.faq.create({
                    data: {
                        category: item.category,
                        icon: item.icon_name || "HelpCircle",
                        question: q.q,
                        answer: q.a
                    }
                });
            }
        }
        revalidatePath("/faq");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Seeding failed" };
    }
}
