import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button, TextInput, Toast } from "flowbite-react";
import { AuthError } from "@supabase/supabase-js";
import { HiMoon, HiSun, HiX } from "react-icons/hi";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter } from "next/router";

export default function Auth() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { darkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      alert("Check your email for the login link!");
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        alert(error.message);
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const lastPath = localStorage.getItem("lastPath");
      if (lastPath && lastPath !== "/") {
        router.push(lastPath);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("Error logging in!", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-4 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="w-full max-w-md">
        <div
          className={`rounded-lg shadow-lg p-8 space-y-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-end">
            <Button
              color={darkMode ? "light" : "dark"}
              size="sm"
              onClick={toggleDarkMode}
              className="!p-2"
            >
              {darkMode ? (
                <HiSun className="h-5 w-5" />
              ) : (
                <HiMoon className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="text-center">
            <h1
              className={`text-3xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome Back
            </h1>
            <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
              Please sign in to your account or create a new one
            </p>
          </div>

          <form className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Email address
              </label>
              <TextInput
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Password
              </label>
              <TextInput
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleSignIn}
                disabled={loading}
                color="dark"
                className="w-full"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <Button
                onClick={handleSignUp}
                disabled={loading}
                color="light"
                className={`w-full ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : ""
                }`}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {toast.show && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <Toast>
            <HiX className="h-5 w-5 text-red-600" />
            <div className="pl-4 text-sm font-normal">{toast.message}</div>
          </Toast>
        </div>
      )}
    </div>
  );
}
