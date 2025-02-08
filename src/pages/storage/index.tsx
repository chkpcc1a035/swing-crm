import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import AddStorageItemModal from "@/components/AddStorageItemModal";
import { initFlowbite } from "flowbite";
import { createClient } from "@/utils/supabase/server-props";

import { Inventory } from "@/types";
import StorageTable from "@/components/StorageTable";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { GetServerSideProps } from "next";
import BatchUploadModal from "@/components/BatchUploadModal";

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

    const { data: inventoryData } = await supabase.from("inventory").select(`
        *,
        product_series (
          series_name
        )
      `);

    // console.log("Inventory Data from getServerSideProps:", inventoryData);

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
  const [modalType, setModalType] = useState<"add" | "batch" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  // const { darkMode } = useTheme();

  useEffect(() => {
    console.log("Storage Management Data:", data);
    initFlowbite();
  }, [data]);

  const filteredData = data?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.stock_location?.toLowerCase().includes(searchLower) ||
      item.sku_number?.toLowerCase().includes(searchLower) ||
      item.product_number?.toLowerCase().includes(searchLower) ||
      item.product_info?.productDescription
        ?.toLowerCase()
        .includes(searchLower) ||
      item.product_series?.series_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AppShell>
      {modalType === "add" && (
        <AddStorageItemModal
          isOpen={true}
          onClose={() => setModalType(null)}
          onSuccess={() => router.refresh()}
        />
      )}
      {modalType === "batch" && (
        <BatchUploadModal
          isOpen={true}
          onClose={() => setModalType(null)}
          onSuccess={() => router.refresh()}
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Storage Management
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setModalType("batch")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
            >
              <FaPlus /> Batch Upload
            </button>
            <button
              onClick={() => setModalType("add")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <FaPlus /> Add Storage
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search by location, SKU, product number, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <StorageTable data={filteredData || []} />
      </div>
    </AppShell>
  );
}
