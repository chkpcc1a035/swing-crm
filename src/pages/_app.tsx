import "@/styles/globals.css";
import type { AppProps } from "next/app";
import FlowbiteInit from "@/pages/components/Flowbiteinit";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <FlowbiteInit />
      <Component {...pageProps} />
    </>
  );
}
