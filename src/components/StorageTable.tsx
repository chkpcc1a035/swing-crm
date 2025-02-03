import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Inventory } from "@/types";
import ViewStorageDetailModal from "./ViewStorageDetailModal";
import { useTheme } from "@/components/ThemeProvider";
import EditStorageModal from "./EditStorageModal";

export default function StorageTable({ data }: { data?: Inventory[] }) {
  const [error] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    show: boolean;
  }>({ x: 0, y: 0, show: false });
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const inventory = useMemo(() => data || [], [data]);
  const { darkMode } = useTheme();

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

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ ...contextMenu, show: false });
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, item: Inventory) => {
    e.preventDefault();
    setSelectedItem(item);
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      show: true,
    });
  };

  // Add your action handlers
  const handleViewDetails = () => {
    setShowModal(true);
    setContextMenu({ ...contextMenu, show: false });
  };

  const handleEdit = (item: Inventory) => {
    setShowModal(false); // Close view modal
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleSave = async (updatedItem: Inventory) => {
    try {
      // Add your API call here to save the updated item
      console.log("Saving updated item:", updatedItem);
      // Refresh the data after successful save
    } catch (error) {
      console.error("Error saving item:", error);
      throw error;
    }
  };

  const handleDelete = () => {
    // Add your delete logic here
    console.log("Delete item:", selectedItem);
    setContextMenu({ ...contextMenu, show: false });
  };

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
    <>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4 text-center w-32">
                Image
              </th>
              <th scope="col" className="p-4 text-left">
                Location
              </th>
              <th scope="col" className="p-4 text-left">
                SKU
              </th>
              <th scope="col" className="p-4 text-left">
                Product Number
              </th>
              <th scope="col" className="p-4 text-left">
                Description
              </th>
              <th scope="col" className="p-4 text-left">
                Qty
              </th>
              <th scope="col" className="p-4 text-right">
                Stock Qty
              </th>
              <th scope="col" className="p-4 text-right">
                Unit Price
              </th>
              <th scope="col" className="p-4 text-right">
                Wholesale
              </th>
              <th scope="col" className="p-4 text-right">
                Retail
              </th>
              <th scope="col" className="p-4 text-right">
                Delivery Fee
              </th>
              <th scope="col" className="p-4 text-right">
                Cost Price
              </th>
              <th scope="col" className="p-4 text-left">
                Category
              </th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr
                key={item.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                onContextMenu={(e) => handleContextMenu(e, item)}
                style={{ cursor: "context-menu" }}
              >
                <td className="p-4 text-center">
                  <div className="flex justify-center">
                    <Image
                      src={
                        signedUrls[item.product_info?.productImagePath] ||
                        "/placeholder.png"
                      }
                      alt={item.product_info?.productDescription || ""}
                      width={100}
                      height={100}
                      className="rounded-lg object-contain"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="p-4 text-gray-900 dark:text-white">
                  {item.stock_location}
                </td>
                <td className="p-4 text-gray-900 dark:text-white">
                  {item.sku_number}
                </td>
                <td className="p-4 text-gray-900 dark:text-white">
                  {item.product_number}
                </td>
                <td className="p-4 text-gray-900 dark:text-white max-w-md">
                  <div className="line-clamp-2">
                    {item.product_info?.productDescription}
                  </div>
                </td>

                <td className="p-4 text-gray-900 dark:text-white text-right">
                  {item.quantity}
                </td>
                <td className="p-4 text-gray-900 dark:text-white text-right">
                  {item.stock_qty}
                </td>

                <td className="p-4 text-gray-900 dark:text-white text-right">
                  ${item.unit_price?.toFixed(2)}
                </td>
                <td className="p-4 text-gray-900 dark:text-white text-right">
                  ${item.wholesale_price?.toFixed(2)}
                </td>
                <td className="p-4 text-gray-900 dark:text-white text-right">
                  ${item.retail_price?.toFixed(2)}
                </td>
                <td className="p-4 text-gray-900 dark:text-white text-right">
                  ${item.delivery_fee?.toFixed(2)}
                </td>
                <td className="p-4 text-gray-900 dark:text-white text-right">
                  ${item.cost_price?.toFixed(2)}
                </td>
                <td className="p-4 text-gray-900 dark:text-white text-left">
                  {item.product_series?.series_name || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Updated Context Menu with better dark mode styling */}
      {contextMenu.show && selectedItem && (
        <div
          className={`fixed shadow-lg rounded-lg py-2 w-48 z-50 border
            ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleViewDetails}
            className={`w-full px-4 py-2 text-left flex items-center gap-2
              ${
                darkMode
                  ? "text-gray-200 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Details
          </button>
          <button
            onClick={() => handleEdit(selectedItem)}
            className={`w-full px-4 py-2 text-left flex items-center gap-2
              ${
                darkMode
                  ? "text-gray-200 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Item
          </button>
          <button
            onClick={handleDelete}
            className={`w-full px-4 py-2 text-left flex items-center gap-2 text-red-500
              ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Item
          </button>
        </div>
      )}

      <ViewStorageDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={selectedItem}
        onEdit={handleEdit}
      />

      <EditStorageModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={selectedItem}
        onSave={handleSave}
      />
    </>
  );
}
