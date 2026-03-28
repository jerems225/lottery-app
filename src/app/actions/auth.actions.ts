"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";
import { auth } from "@/auth";

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

    // Validate referredById exists in DB to avoid P2003 Foreign Key Violation
    let validReferredById = null;
    if (referredById && referredById.trim() !== "" && referredById !== "null" && referredById !== "undefined") {
        try {
            const referrer = await prisma.user.findUnique({ where: { id: referredById } });
            if (referrer) {
                validReferredById = referredById;
            }
        } catch (e) {
            validReferredById = null;
        }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "USER",
                balance: 0,
                referredById: validReferredById,
                verificationCode,
                isVerified: false,
            }
        });

        // Send real email with Resend
        await sendVerificationEmail(email, verificationCode);
        console.log(`[REAL MAIL ATTEMPT] Code for ${email}: ${verificationCode}`);

        return { success: true, email };
    } catch (error: any) {
        console.error("REGISTRATION ERROR:", error);
        if (error.code === 'P2002') return { error: "Email already exists" };
        if (error.code === 'P2003') return { error: "Referral ID is invalid or linked account does not exist." };
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

        // Resend via Resend
        await sendVerificationEmail(email, newCode);
        console.log(`[RESEND REAL MAIL ATTEMPT] New code for ${email}: ${newCode}`);

        return { success: true };
    } catch (error: any) {
        return { error: "Failed to resend code" };
    }
}
/**
 * Password Reset: Step 1 - Send Code
 */
export async function forgotPasswordAction(email: string) {
    if (!email) return { error: "Email is required" };

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return { error: "If this email exists, a reset code has been sent." };

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
            where: { email },
            data: { verificationCode: resetCode } // Re-using this field for simplicity or could add resetCode field
        });

        await sendPasswordResetEmail(email, resetCode);
        return { success: true };
    } catch (error) {
        return { error: "Failed to process request" };
    }
}

/**
 * Password Reset: Step 1.5 - Verify Code Only (UI convenience)
 */
export async function verifyResetCodeAction(email: string, code: string) {
    if (!email || !code) return { error: "Email and code are required" };

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        // Use the same verificationCode field as in forgotPasswordAction
        if (!user || user.verificationCode !== code) return { error: "Invalid reset code" };

        return { success: true };
    } catch (error) {
        return { error: "Verification failed" };
    }
}

/**
 * Password Reset: Step 2 - Verify & Update
 */
export async function resetPasswordAction(formData: FormData) {
    const email = formData.get("email") as string;
    const code = formData.get("code") as string;
    const newPassword = formData.get("password") as string;

    if (!email || !code || !newPassword) return { error: "All fields are required" };

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.verificationCode !== code) return { error: "Invalid reset code" };

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                verificationCode: null
            }
        });

        return { success: true };
    } catch (error) {
        return { error: "Failed to reset password" };
    }
}

/**
 * Update Password from Profile
 */
export async function updatePasswordAction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Not authenticated" };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) return { error: "Both passwords are required" };

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user || !user.password) return { error: "User not found" };

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return { error: "Current password is incorrect" };

        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashed }
        });

        return { success: true };
    } catch (error) {
        return { error: "Failed to update password" };
    }
}

/**
 * Update User Info (Name, Image)
 */
export async function updateUserAction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    const name = formData.get("name") as string;
    const image = formData.get("image") as string;

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name && { name }),
                ...(image && { image })
            }
        });

        return { success: true };
    } catch (error) {
        return { error: "Failed to update profile" };
    }
}

/**
 * Fetch the latest user balance directly from the database for real-time frontend syncing.
 */
export async function getLatestBalanceAction() {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { balance: true }
        });
        if (!user) return { success: false };

        return { success: true, balance: user.balance };
    } catch (error) {
        return { success: false };
    }
}
