import "@/styles/globals.css";
import type { AppProps } from "next/app";
import FlowbiteInit from "@/pages/components/Flowbiteinit";
import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <FlowbiteInit />
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
