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
import { logToCloud } from "@/utils/logging";

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
    await logToCloud("info", "[AuthContext] Login attempt", {
      email,
      pathname,
    });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    await logToCloud(error ? "error" : "info", "[AuthContext] Login result", {
      success: !error,
      error: error?.message,
    });

    return !error;
  };

  const logout = async () => {
    await logToCloud("info", "[AuthContext] Logout initiated", {
      pathname,
    });

    await supabase.auth.signOut();
    setIsAuthenticated(false);

    await logToCloud("info", "[AuthContext] Logout completed");
    router.push("/login");
  };

  useEffect(() => {
    const initAuth = async () => {
      await logToCloud("info", "[AuthContext] Initializing auth", {
        pathname,
      });

      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setIsAuthenticated(!!session);

        if (!session && pathname !== "/login") {
          await logToCloud("info", "[AuthContext] Redirecting to login", {
            reason: "no_session",
            from: pathname,
          });
          router.push("/login");
        } else if (session && pathname === "/login") {
          await logToCloud("info", "[AuthContext] Redirecting to inventory", {
            reason: "already_authenticated",
          });
          router.push("/inventory");
        }
      } catch (error) {
        await logToCloud("error", "[AuthContext] Initialization error", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await logToCloud("info", "[AuthContext] Auth state changed", {
        event,
        hasSession: !!session,
        pathname,
      });

      setIsAuthenticated(!!session);

      if (!session && pathname !== "/login") {
        await logToCloud("info", "[AuthContext] Redirecting to login", {
          reason: "auth_state_change",
        });
        router.push("/login");
      } else if (session && pathname === "/login") {
        await logToCloud("info", "[AuthContext] Redirecting to inventory", {
          reason: "auth_state_change",
        });
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
