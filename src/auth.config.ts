import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    callbacks: {

        async jwt({ token, user, trigger, session }: { token: any, user: any, trigger?: string, session?: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.balance = user.balance;
                token.image = user.image;
                token.isVerified = user.isVerified;
            }
            if (trigger === "update" && session) {
                if (session.image) token.image = session.image;
                if (session.name) token.name = session.name;
                if (session.balance !== undefined) token.balance = session.balance;
                if (session.isVerified !== undefined) token.isVerified = session.isVerified;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.balance = token.balance;
                session.user.image = token.image;
                session.user.isVerified = token.isVerified;
            }
            return session;
        },
    },
    providers: [], // Empty providers for now, will be populated in auth.ts
    // Suppress terminal errors for failed signins
    logger: {
        error(code, ...args) {
          if (code.name === "CredentialsSignin") return;
          console.error(code, ...args);
        },
    },
} satisfies NextAuthConfig;
