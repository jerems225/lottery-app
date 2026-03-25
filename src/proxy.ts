import { auth } from "@/auth";

export default auth((req: any) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Protected routes
    const protectedRoutes = ["/rooms", "/profile", "/affiliation"];
    const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));

    if (isProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
