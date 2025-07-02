import { clerkMiddleware, createRouteMatcher, getAuth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(['/admin','/resources(.*)', '/projects']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})




export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};



// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5 // change this as needed

export function middleware(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  const existing = rateLimitMap.get(ip)

  if (existing && now - existing.timestamp < WINDOW_MS) {
    if (existing.count >= MAX_REQUESTS) {
      return new Response('Too many requests', { status: 429 })
    } else {
      existing.count++
    }
  } else {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'], // Applies only to /api routes
}
