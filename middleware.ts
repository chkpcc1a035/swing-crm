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
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Get the pathname from the URL
    const path = req.nextUrl.pathname;

    // Skip auth check for RSC requests
    if (req.headers.get("RSC") === "1") {
      return res;
    }

    // Create absolute URLs for redirects
    const baseUrl = req.nextUrl.origin;

    // If there's no session and we're not already on /login
    if (!session && path !== "/login") {
      const redirectUrl = new URL("/login", baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    // If there's a session and we're on /login
    if (session && path === "/login") {
      const redirectUrl = new URL("/inventory", baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error("[Middleware] Error:", error);
    // In case of error, allow the request to continue
    return NextResponse.next();
  }
}
