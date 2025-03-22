import { defineMiddleware } from "astro:middleware";

// Middleware to handle CORS and verify authentication tokens
export const onRequest = defineMiddleware(async (context, next) => {
    // Handle preflight (CORS OPTIONS requests)
    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    // Get cookies (tokens)
    const accessToken = context.cookies.get("sb-access-token");
    const refreshToken = context.cookies.get("sb-refresh-token");

    // Get the requested URL
    const url = new URL(context.request.url);

    // Exclude API routes and sign-in page from token verification
    if (url.pathname.startsWith("/api/") || url.pathname === "/signin") {
        const response = await next();
        
        // Apply CORS headers to API responses
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");

        return response;
    }

    // If no valid tokens, redirect to signin
    if (!accessToken || !refreshToken) {
        return context.redirect("/signin");
    }

    // Continue to the next middleware or page
    return next();
});
