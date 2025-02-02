"use client";

import AppShell from "@/components/AppShell";

export default function Dashboard() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600 h-32 md:h-64"></div>
      </div>
    </AppShell>
  );
}
