import { defineMiddleware } from "astro:middleware";

// Middleware to verify the tokens
export const onRequest = defineMiddleware(async (context, next) => {
    // Get the cookies
    const accessToken = context.cookies.get("sb-access-token");
    const refreshToken = context.cookies.get("sb-refresh-token");

    // Get the requested URL
    const url = new URL(context.request.url);

    // Exclude API routes and signIn from the token verification
    if (url.pathname.startsWith("/api/") || url.pathname === "/signin") {
        return next(); // If the URL starts with /api/ or equals to signin, don't apply the middleware
    }

    // If there are no access or refresh tokens, redirect to signin
    if (!accessToken || !refreshToken) {
        return context.redirect("/signin");
    }

    // If everything is fine, continue with the next middleware or the page
    return next();
});
