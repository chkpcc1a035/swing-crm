"use client";

import { Metadata } from "next";
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";
import { I18nProvider } from "@/contexts/i18nProvider";
import "@mantine/core/styles.css";
import { usePathname } from "next/navigation";

export const metadata: Metadata = {
  title: "SKU Manager",
  description: "SKU Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="light">
          <I18nProvider>
            <AuthProvider>
              {isLoginPage ? children : <Dashboard>{children}</Dashboard>}
            </AuthProvider>
          </I18nProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
