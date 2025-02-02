import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Auth from "@/components/Auth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const session = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (session) {
        const lastPath = localStorage.getItem("lastPath") || "/dashboard";
        await router.push(lastPath);
      }
      setIsLoading(false);
    };

    checkSession();
  }, [session, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <Auth />;
}
