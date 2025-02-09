import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import { createClient } from "@/utils/supabase/server-props";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { GetServerSideProps } from "next";
import AddOrderModal from "@/components/AddOrderModal";
import OrderTable from "@/components/OrderTable";
import { OrderTableProps } from "@/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createClient(context);

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const { data: transactionsData } = await supabase.from(
      "inventory_transactions"
    ).select(`
        *,
        inventory (
          id,
          product_info,
          sku_number,
          product_number
        )
      `);

    return {
      props: {
        data: transactionsData || [],
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

interface PaymentManagementProps {
  data: OrderTableProps[];
}

export default function PaymentManagement({ data }: PaymentManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  console.log("showAddModal:", showAddModal);

  useEffect(() => {
    initFlowbite();
  }, []);

  const filteredData = data?.filter((item: OrderTableProps) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.reference_number?.toLowerCase().includes(searchLower) ||
      item.transaction_type?.toLowerCase().includes(searchLower) ||
      item.from_location?.toLowerCase().includes(searchLower) ||
      item.to_location?.toLowerCase().includes(searchLower) ||
      item.inventory?.sku_number?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AppShell>
      {showAddModal && (
        <AddOrderModal
          isOpen={true}
          onClose={() => {
            console.log("onClose called");
            setShowAddModal(false);
          }}
          onSuccess={() => router.refresh()}
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Management
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <FaPlus /> Add Payment
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search by reference number, type, location, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <OrderTable data={filteredData || []} />
      </div>
    </AppShell>
  );
}
