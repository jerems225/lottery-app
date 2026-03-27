import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) return null;

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordCorrect) return null;

                // Check for Total Block
                if (user.isTotalBlock && user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
                    throw new Error("Your account has been restricted. Access denied.");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    balance: user.balance,
                    image: user.image,
                    isVerified: user.isVerified
                };
            },
        }),
    ],
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
    pages: {
        signIn: "/login",
    },
});
