import { createServerClient } from "@supabase/ssr";
import { GetServerSidePropsContext } from "next";

export function createClient(context: GetServerSidePropsContext) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name];
        },
        set(name: string, value: string) {
          context.res.setHeader("Set-Cookie", `${name}=${value}`);
        },
        remove(name: string) {
          context.res.setHeader("Set-Cookie", `${name}=; Max-Age=0`);
        },
      },
    }
  );
}
