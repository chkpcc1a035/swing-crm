import { useState } from "react";
import Image from "next/image";
import { Inventory } from "@/types";

interface ProductSeries {
  series_name: string;
}

// Configure Next.js Image component to allow SVG
const imageLoader = ({ src }: { src: string }) => {
  return src.startsWith("/") ? src : "/placeholder.png";
};

export default function StorageTable({ data }: { data?: Inventory[] }) {
  const [inventory, setInventory] = useState<Inventory[]>(data || []);
  const [error, setError] = useState<string | null>(null);

  // Remove or comment out the useEffect since we're using static props
  // useEffect(() => {
  //   setInventory(mockInventory);
  // }, []);

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
            <th className="p-4">Product</th>
            <th className="p-4">SKU</th>
            <th className="p-4">Quantity</th>
            <th className="p-4">Price</th>
            <th className="p-4">Series</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-4">
                <Image
                  src={item.product_info?.image_url || "/placeholder.png"}
                  alt={item.product_info?.name || ""}
                  width={100}
                  height={100}
                  unoptimized
                />
              </td>
              <td className="p-4">{item.product_info?.name}</td>
              <td className="p-4">{item.sku_number}</td>
              <td className="p-4">{item.quantity}</td>
              <td className="p-4">${item.retail_price?.toFixed(2)}</td>
              <td className="p-4">{item.product_series?.series_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
