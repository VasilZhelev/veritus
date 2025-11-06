/**
 * Server-side authentication utilities
 * Use these in API routes, Server Components, or Middleware for SSR protection
 */

import { adminAuth } from "./admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get the Firebase ID token from the request
 * Looks for token in Authorization header or cookies
 */
export async function getTokenFromRequest(req: NextRequest): Promise<string | null> {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try cookie
  const tokenCookie = req.cookies.get("auth-token");
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * Verify Firebase ID token on the server
 * Returns the decoded token or null if invalid
 */
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}

/**
 * Get the current user from the request (server-side)
 * Use this in API routes or Server Components
 */
export async function getServerUser(req?: NextRequest) {
  if (!req) return null;

  const token = await getTokenFromRequest(req);
  if (!token) return null;

  const decodedToken = await verifyIdToken(token);
  return decodedToken;
}

/**
 * Middleware helper to protect routes
 * Returns NextResponse.redirect() if not authenticated, or null if authenticated
 */
export async function requireAuth(req: NextRequest): Promise<NextResponse | null> {
  const token = await getTokenFromRequest(req);
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decodedToken = await verifyIdToken(token);
  
  if (!decodedToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return null; // User is authenticated
}

/**
 * Example usage in API route:
 * 
 * export async function GET(req: NextRequest) {
 *   const user = await getServerUser(req);
 *   if (!user) {
 *     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *   }
 *   // ... your protected logic
 * }
 * 
 * Example usage in Middleware:
 * 
 * export async function middleware(req: NextRequest) {
 *   const redirect = await requireAuth(req);
 *   if (redirect) return redirect;
 *   return NextResponse.next();
 * }
 */

