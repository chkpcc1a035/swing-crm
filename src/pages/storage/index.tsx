import AppShell from "@/components/AppShell";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import AddStorageItemModal from "@/components/AddStorageItemModal";
import { initFlowbite } from "flowbite";
import { createClient } from "@/utils/supabase/static-props";
import { Inventory } from "@/types";
import StorageTable from "@/components/StorageTable";

export async function getStaticProps() {
  const supabase = createClient();

  try {
    // Now fetch the actual data
    const { data, error } = await supabase.from("inventory").select(`
        *,
        product_series (*)
      `);

    // Add debug logging
    console.log("Raw Query Result:", { data, error });

    if (error) {
      console.error("Error in getStaticProps:", error);
      return {
        props: {},
        revalidate: 60,
      };
    }

    if (!data || data.length === 0) {
      console.log("No data found in inventory table");
      return {
        props: {
          data: [],
        },
        revalidate: 60,
      };
    }

    // Ensure dates are serialized properly
    const serializedData = data.map((item) => ({
      ...item,
      created_at: item.created_at?.toString(),
      website_status: item.website_status
        ? JSON.parse(JSON.stringify(item.website_status))
        : null,
      product_info: item.product_info
        ? JSON.parse(JSON.stringify(item.product_info))
        : null,
    }));

    // Log the shape of the data we're returning
    console.log("Returning data shape:", {
      dataLength: serializedData?.length,
      firstRecord: serializedData?.[0],
    });

    return {
      props: {
        data: serializedData,
      },
      revalidate: 60,
    };
  } catch (e) {
    console.error("Unexpected error in getStaticProps:", e);
    return {
      props: {},
      revalidate: 60,
    };
  }
}

export default function StorageManagement({ data }: { data?: Inventory[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    initFlowbite();
  }, []);

  // Add debug logging effect
  useEffect(() => {
    console.log("Storage Management Data:", data);
  }, [data]);

  return (
    <AppShell>
      <AddStorageItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Storage Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>Add Storage</Button>
        </div>
        <StorageTable data={data || []} />
      </div>
    </AppShell>
  );
}
