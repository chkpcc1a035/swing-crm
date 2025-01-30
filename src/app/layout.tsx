import { Metadata } from "next";
import "@mantine/core/styles.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "SKU Manager",
  description: "SKU Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
