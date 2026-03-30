import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Next.js 16 Proxy (Middleware)
 * 
 * Handles global authentication, token validation, and role-based redirects.
 * Fixed to prevent infinite redirect loops.
 */
const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
    try {
        const { nextUrl } = req;
        const isLoggedIn = !!req.auth?.user;
        const role = req.auth?.user?.role;
        const pathname = nextUrl.pathname;

        // 1. Define Routes
        const isGuestOnlyRoute = ["/login", "/register", "/verify", "/error"].some(path => 
            pathname === path || pathname.startsWith(path)
        );
        
        const isPublicRoute = ["/", "/faq", "/ref", "/unauthorized"].some(path => 
            pathname === path || pathname.startsWith(path)
        ) || pathname.startsWith("/api/auth");

        // 2. Prevent Redirect Loops (If we are already where we want to go)
        const isTargetingRooms = pathname.startsWith("/rooms");

        // 3. LOGGED-IN USERS: Redirect away from Guest-Only routes (except /verify if not verified)
        if (isLoggedIn && isGuestOnlyRoute) {
            const isVerifyRoute = pathname.startsWith("/verify");
            const isVerified = req.auth?.user?.isVerified;

            if (isVerifyRoute && !isVerified) return null; // Let them verify
            
            // Redirect to target or /rooms
            const callbackUrl = nextUrl.searchParams.get("callbackUrl");
            const redirectTo = callbackUrl ? decodeURIComponent(callbackUrl) : "/rooms";
            
            if (pathname !== redirectTo) {
                return Response.redirect(new URL(redirectTo, nextUrl));
            }
        }

        // 4. GUESTS: Protect non-public routes
        if (!isLoggedIn && !isPublicRoute && !isGuestOnlyRoute) {
            // Avoid redirecting to login if we are already there
            if (pathname !== "/login") {
                let callbackUrl = pathname;
                if (nextUrl.search) callbackUrl += nextUrl.search;
                const encodedCallbackUrl = encodeURIComponent(callbackUrl);
                return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
            }
        }

        // 5. Role-based Protections
        if (isLoggedIn) {
            if (pathname.startsWith('/agent')) {
                if (!["AGENT", "ADMIN", "SUPERADMIN"].includes(role)) {
                    return Response.redirect(new URL('/', nextUrl));
                }
            }
            if (pathname.startsWith('/admin')) {
                if (role === "AGENT") return Response.redirect(new URL('/agent', nextUrl));
                if (!["MANAGER", "ADMIN", "SUPERADMIN"].includes(role)) {
                    return Response.redirect(new URL('/', nextUrl));
                }
            }
        }

        return null; // Let the request proceed
    } catch (error) {
        console.error("Middleware Auth Error:", error);
        return null; // In case of error, fallback to allowing request to avoid infinite loops
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
