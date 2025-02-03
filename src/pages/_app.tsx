import "@/styles/globals.css";
import type { AppProps } from "next/app";
import FlowbiteInit from "@/components/Flowbiteinit";
import { createBrowserClient } from "@supabase/ssr";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function App({ Component, pageProps }: AppProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <ThemeProvider>
        <FlowbiteInit />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionContextProvider>
  );
}
