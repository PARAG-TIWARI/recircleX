import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/individual/auth(.*)",
  "/business/auth(.*)",
  "/api/(.*)",
]);

const isBusinessRoute = createRouteMatcher([
  "/business/(.*)",
  "/admin(.*)",
]);

export const middleware = clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    // Send business/admin route visitors to the business portal
    const redirectUrl = isBusinessRoute(req)
      ? new URL("/business/auth", req.url).toString()
      : new URL("/individual/auth", req.url).toString();

    auth().protect({ unauthenticatedUrl: redirectUrl });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
