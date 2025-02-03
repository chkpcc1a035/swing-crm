import AppShell from "@/components/AppShell";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import AddStorageItemModal from "@/components/AddStorageItemModal";
import { initFlowbite } from "flowbite";
import { createClient } from "@/utils/supabase/server-props";

import { Inventory } from "@/types";
import StorageTable from "@/components/StorageTable";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { GetServerSideProps } from "next";

// import { useTheme } from "@/components/ThemeProvider";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createClient(context);

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    console.log("Auth check in storage getServerSideProps:", {
      session,
      error,
    });

    if (error || !session) {
      console.log("No session in storage, redirecting to login");
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const { data: inventoryData } = await supabase
      .from("inventory")
      .select("*");

    return {
      props: {
        data: inventoryData || [],
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

export default function StorageManagement({ data }: { data?: Inventory[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  // const { darkMode } = useTheme();

  useEffect(() => {
    console.log("Storage Management Data:", data);
    initFlowbite();
  }, [data]);

  return (
    <AppShell>
      <AddStorageItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Storage Management
          </h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <div className="inline-flex items-center justify-center gap-2 relative top-[0.5px]">
              <FaPlus className="h-4 w-4" />
              <span>Add Storage</span>
            </div>
          </Button>
        </div>
        <StorageTable data={data || []} />
      </div>
    </AppShell>
  );
}
