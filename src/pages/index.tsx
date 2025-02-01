import { useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Auth from "@/components/Auth";
import LoadingSpinner from "./components/LoadingSpinner";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (session) {
    return <LoadingSpinner />;
  }

  return <Auth />;
}
