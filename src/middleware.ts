import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    // Protected routes
    const protectedRoutes = ["/rooms", "/profile", "/affiliation"];
    const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));

    if (isProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
    }

    // Agent Exclusive Routing (Non-Admin Hierarchy)
    if (nextUrl.pathname.startsWith('/agent')) {
        if (!isLoggedIn) {
            return Response.redirect(new URL('/login', nextUrl));
        }

        // Admins can potentially view it too if they need to, but mainly AGENT
        if (role !== "AGENT" && role !== "SUPERADMIN" && role !== "ADMIN") {
            return Response.redirect(new URL('/', nextUrl));
        }
    }

    // Admin routes protection (Strictly Manager/Admin/SuperAdmin)
    if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) {
            return Response.redirect(new URL('/login', nextUrl));
        }

        if (role === "AGENT") {
            return Response.redirect(new URL('/agent', nextUrl));
        }

        const allowedAdminRoles = ["MANAGER", "ADMIN", "SUPERADMIN"];
        if (!role || !allowedAdminRoles.includes(role)) {
            return Response.redirect(new URL('/', nextUrl)); // Unauthorized user is sent to home
        }
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

