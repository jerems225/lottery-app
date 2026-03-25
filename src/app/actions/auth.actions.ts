"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Register a new user with email/password credentials.
 * Applies a welcome bonus to the new account.
 */
export async function registerUserAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const referredById = formData.get("referredById") as string | null;

    if (!email || !password) return { error: "Email and password are required" };

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "USER",
                balance: 1000,
                referredById: referredById || null,
                verificationCode,
                isVerified: false,
            }
        });

        // TODO: Send email with verificationCode using nodemailer/resend
        console.log(`[EMAIL SEND] Code for ${email}: ${verificationCode}`);

        return { success: true, email };
    } catch (error: any) {
        if (error.code === 'P2002') return { error: "Email already exists" };
        return { error: "Internal server error" };
    }
}

/**
 * Verify account using the 6-digit code.
 */
export async function verifyCodeAction(email: string, code: string) {
    if (!email || !code) return { error: "Email and code are required" };

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) return { error: "User not found" };
        if (user.isVerified) return { error: "Account already verified" };

        if (user.verificationCode === code) {
            await prisma.user.update({
                where: { email },
                data: {
                    isVerified: true,
                    verificationCode: null
                }
            });
            return { success: true };
        } else {
            return { error: "Invalid verification code" };
        }
    } catch (error: any) {
        return { error: "Verification failed" };
    }
}

/**
 * Resend a new 6-digit code.
 */
export async function resendVerificationCodeAction(email: string) {
    if (!email) return { error: "Email is required" };

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return { error: "User not found" };
        if (user.isVerified) return { error: "Account already verified" };

        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
            where: { email },
            data: { verificationCode: newCode }
        });

        // TODO: Send email with newCode
        console.log(`[RESEND EMAIL] New code for ${email}: ${newCode}`);

        return { success: true };
    } catch (error: any) {
        return { error: "Failed to resend code" };
    }
}
