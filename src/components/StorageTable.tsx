import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Inventory } from "@/types";
// import { useTheme } from "@/components/ThemeProvider";

export default function StorageTable({ data }: { data?: Inventory[] }) {
  const [error] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const inventory = useMemo(() => data || [], [data]);
  // const { darkMode } = useTheme();

  useEffect(() => {
    const fetchSignedUrls = async () => {
      const urls: Record<string, string> = {};

      for (const item of inventory) {
        if (item.product_info?.productImagePath) {
          try {
            const filename = item.product_info.productImagePath
              .split("/")
              .pop();
            const response = await fetch(
              `/api/getSignedURL?filename=${filename}`
            );
            const data = await response.json();
            urls[item.product_info.productImagePath] = data.url;
          } catch (err) {
            console.error("Error fetching signed URL:", err);
          }
        }
      }

      setSignedUrls(urls);
    };

    fetchSignedUrls();
  }, [inventory]);

  if (error) {
    return <div className="w-full p-4 text-red-500 text-center">{error}</div>;
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="w-full p-4 text-gray-500 dark:text-gray-400 text-center">
        No items found in inventory
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">
              Image
            </th>
            <th scope="col" className="p-4">
              Location
            </th>
            <th scope="col" className="p-4">
              SKU
            </th>
            <th scope="col" className="p-4">
              Product Number
            </th>
            <th scope="col" className="p-4">
              Description
            </th>
            <th scope="col" className="p-4">
              Stock Qty
            </th>
            <th scope="col" className="p-4">
              Unit Price
            </th>
            <th scope="col" className="p-4">
              Wholesale
            </th>
            <th scope="col" className="p-4">
              Retail
            </th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr
              key={item.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="p-4">
                <Image
                  src={
                    signedUrls[item.product_info?.productImagePath] ||
                    "/placeholder.png"
                  }
                  alt={item.product_info?.productDescription || ""}
                  width={100}
                  height={100}
                  className="rounded-lg"
                  unoptimized
                />
              </td>
              <td className="p-4 text-gray-900 dark:text-white whitespace-nowrap">
                {item.stock_location}
              </td>
              <td className="p-4 text-gray-900 dark:text-white whitespace-nowrap">
                {item.sku_number}
              </td>
              <td className="p-4 text-gray-900 dark:text-white whitespace-nowrap">
                {item.product_number}
              </td>
              <td className="p-4 text-gray-900 dark:text-white">
                {item.product_info?.productDescription}
              </td>
              <td className="p-4 text-gray-900 dark:text-white whitespace-nowrap">
                {item.stock_qty}
              </td>
              <td className="p-4 text-gray-900 dark:text-white whitespace-nowrap">
                ${item.unit_price?.toFixed(2)}
              </td>
              <td className="p-4 text-gray-900 dark:text-white whitespace-nowrap">
                ${item.wholesale_price?.toFixed(2)}
              </td>
              <td className="p-4 text-gray-900 dark:text-white whitespace-nowrap">
                ${item.retail_price?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
