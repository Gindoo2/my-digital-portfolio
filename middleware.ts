import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Clerk Protected Routes
const isProtectedRoute = createRouteMatcher([
  '/admin',
  '/resources(.*)',
  '/projects',
]);

// 2. Rate Limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Rate limiting logic
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const existing = rateLimitMap.get(ip);

  if (existing && now - existing.timestamp < WINDOW_MS) {
    if (existing.count >= MAX_REQUESTS) {
      return new Response('Too many requests', { status: 429 });
    } else {
      existing.count++;
    }
  } else {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
  }

  // Clerk auth protection
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
