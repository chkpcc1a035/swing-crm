import AppShell from "@/components/AppShell";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import AddStorageItemModal from "@/components/AddStorageItemModal";
import { initFlowbite } from "flowbite";
import { createClient } from "@/utils/supabase/static-props";
import { Inventory } from "@/types";
import StorageTable from "@/components/StorageTable";
import Image from "next/image";

export async function getStaticProps() {
  const supabase = createClient();
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                <th className="p-4">Product Info</th>
                <th className="p-4">SKU / Product Number</th>
                <th className="p-4">Stock Location</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Prices</th>
                <th className="p-4">Website Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={
                          item.product_info?.productImagePath ||
                          "/placeholder.png"
                        }
                        alt={item.product_info?.productDescription || ""}
                        width={50}
                        height={50}
                        className="rounded-sm"
                        unoptimized
                      />
                      <div>
                        <p className="font-medium">
                          {item.product_info?.productDescription}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p>SKU: {item.sku_number}</p>
                      <p className="text-gray-500">
                        Product: {item.product_number}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">{item.stock_location}</td>
                  <td className="p-4">
                    <div>
                      <p>Stock: {item.stock_qty}</p>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p>Retail: ${item.retail_price?.toFixed(2)}</p>
                      <p>Wholesale: ${item.wholesale_price?.toFixed(2)}</p>
                      <p>Cost: ${item.cost_price?.toFixed(2)}</p>
                      <p>Unit: ${item.unit_price?.toFixed(2)}</p>
                      <p>Delivery: ${item.delivery_fee?.toFixed(2)}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p>
                        Stocked: {item.website_status?.isStocked ? "Yes" : "No"}
                      </p>
                      <p>
                        Updated:{" "}
                        {item.website_status?.updatedDatabase ? "Yes" : "No"}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
