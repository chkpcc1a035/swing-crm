import "@/styles/globals.css";
import type { AppProps } from "next/app";
import FlowbiteInit from "@/components/Flowbiteinit";
import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ThemeProvider } from "@/components/ThemeProvider";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <ThemeProvider>
        <FlowbiteInit />
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionContextProvider>
  );
}
