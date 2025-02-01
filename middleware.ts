// middleware.ts

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// middleware.ts
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(req: NextRequest) {
  try {
    console.log(
      "[Middleware] Processing request for path:",
      req.nextUrl.pathname
    );
    console.log(
      "[Middleware] Request headers:",
      Object.fromEntries(req.headers)
    );

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("[Middleware] Session exists:", !!session);

    const path = req.nextUrl.pathname;
    console.log("[Middleware] Current path:", path);

    // Skip auth check for RSC requests
    if (req.headers.get("RSC") === "1") {
      console.log("[Middleware] RSC request detected, skipping auth check");
      return res;
    }

    // Create absolute URLs for redirects
    const baseUrl = req.nextUrl.origin;
    console.log("[Middleware] Base URL:", baseUrl);

    // If there's no session and we're not already on /login
    if (!session && path !== "/login") {
      console.log("[Middleware] No session, redirecting to /login");
      const redirectUrl = new URL("/login", baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    // If there's a session and we're on /login
    if (session && path === "/login") {
      console.log(
        "[Middleware] Session exists on login page, redirecting to /inventory"
      );
      const redirectUrl = new URL("/inventory", baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    console.log("[Middleware] Allowing request to continue");
    return res;
  } catch (error) {
    console.error("[Middleware] Error:", error);
    // In case of error, allow the request to continue
    return NextResponse.next();
  }
}
