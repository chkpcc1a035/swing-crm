// src/contexts/AuthContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const login = async (email: string, password: string) => {
    console.log("[AuthContext][login] Attempting login for:", email);
    console.log("[AuthContext][login] Current pathname:", pathname);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log(
      "[AuthContext][login] Login result:",
      error ? `Error: ${error.message}` : "Success"
    );
    return !error;
  };

  const logout = async () => {
    console.log("[AuthContext][logout] Starting logout process");
    console.log("[AuthContext][logout] Current pathname:", pathname);
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    console.log("[AuthContext][logout] User logged out, redirecting to /login");
    router.push("/login");
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log("[AuthContext][initAuth] Starting auth initialization");
      console.log("[AuthContext][initAuth] Current pathname:", pathname);
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("[AuthContext][initAuth] Session status:", !!session);
        setIsAuthenticated(!!session);

        if (!session && pathname !== "/login") {
          console.log(
            "[AuthContext][initAuth] No session, redirecting to /login"
          );
          router.push("/login");
        } else if (session && pathname === "/login") {
          console.log(
            "[AuthContext][initAuth] Has session, redirecting to /inventory"
          );
          router.push("/inventory");
        }
      } catch (error) {
        console.error("[AuthContext][initAuth] Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthContext][onAuthStateChange] Auth event:", event);
      console.log(
        "[AuthContext][onAuthStateChange] Current pathname:",
        pathname
      );
      setIsAuthenticated(!!session);

      if (!session && pathname !== "/login") {
        console.log(
          "[AuthContext][onAuthStateChange] No session, redirecting to /login"
        );
        router.push("/login");
      } else if (session && pathname === "/login") {
        console.log(
          "[AuthContext][onAuthStateChange] Has session, redirecting to /inventory"
        );
        router.push("/inventory");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
