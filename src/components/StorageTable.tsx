import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Inventory } from "@/types";

export default function StorageTable({ data }: { data?: Inventory[] }) {
  const [error] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const inventory = useMemo(() => data || [], [data]);

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
      <div className="w-full p-4 text-gray-500 text-center">
        No items found in inventory
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr>
            <th className="p-4">Image</th>
            <th className="p-4">Location</th>
            <th className="p-4">SKU</th>
            <th className="p-4">Product Number</th>
            <th className="p-4">Description</th>
            <th className="p-4">Stock Qty</th>
            <th className="p-4">Unit Price</th>
            <th className="p-4">Wholesale</th>
            <th className="p-4">Retail</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-4">
                <Image
                  src={
                    signedUrls[item.product_info?.productImagePath] ||
                    "/placeholder.png"
                  }
                  alt={item.product_info?.productDescription || ""}
                  width={100}
                  height={100}
                  unoptimized
                />
              </td>
              <td className="p-4">{item.stock_location}</td>
              <td className="p-4">{item.sku_number}</td>
              <td className="p-4">{item.product_number}</td>
              <td className="p-4">{item.product_info?.productDescription}</td>
              <td className="p-4">{item.stock_qty}</td>
              <td className="p-4">${item.unit_price?.toFixed(2)}</td>
              <td className="p-4">${item.wholesale_price?.toFixed(2)}</td>
              <td className="p-4">${item.retail_price?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
