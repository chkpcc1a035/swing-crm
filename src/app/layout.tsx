import { Metadata } from "next";
import "@mantine/core/styles.css";

export const metadata: Metadata = {
  title: "SKU Manager",
  description: "SKU Management System",
};

// Separate server component for metadata
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}

// Client component for interactive features
("use client");
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";
import { I18nProvider } from "@/contexts/i18nProvider";
import { usePathname } from "next/navigation";

function ClientLayout({ children }: { children: React.ReactNode }) {
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
