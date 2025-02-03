import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Auth from "@/components/Auth";
import LoadingSpinner from "../components/LoadingSpinner";
import { createBrowserClient } from "@supabase/ssr";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const lastPath = localStorage.getItem("lastPath") || "/dashboard";
        console.log(`User already logged in, redirecting to ${lastPath}`);
        await router.replace(lastPath);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <Auth />;
}
