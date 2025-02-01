// middleware.ts

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logToCloud } from "@/utils/logging";

// middleware.ts
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(req: NextRequest) {
  try {
    await logToCloud("info", "[Middleware] Processing request", {
      path: req.nextUrl.pathname,
      headers: Object.fromEntries(req.headers),
    });

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    await logToCloud("info", "[Middleware] Session check", {
      hasSession: !!session,
      path: req.nextUrl.pathname,
    });

    if (req.headers.get("RSC") === "1") {
      await logToCloud("info", "[Middleware] RSC request detected", {
        path: req.nextUrl.pathname,
      });
      return res;
    }

    const baseUrl = req.nextUrl.origin;

    if (!session && req.nextUrl.pathname !== "/login") {
      await logToCloud("info", "[Middleware] Redirecting to login", {
        from: req.nextUrl.pathname,
        reason: "no_session",
      });
      const redirectUrl = new URL("/login", baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    if (session && req.nextUrl.pathname === "/login") {
      await logToCloud("info", "[Middleware] Redirecting to inventory", {
        reason: "already_authenticated",
      });
      const redirectUrl = new URL("/inventory", baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    await logToCloud("error", "[Middleware] Error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.next();
  }
}
