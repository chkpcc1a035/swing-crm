import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Inventory } from "@/types";
import ViewStorageDetailModal from "./ViewStorageDetailModal";
import { useTheme } from "@/components/ThemeProvider";
import EditStorageModal from "./EditStorageModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useSession } from "@supabase/auth-helpers-react";
import PreDeleteConfirmationModal from "./PreDeleteConfirmationModal";

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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreDeleteModal, setShowPreDeleteModal] = useState(false);
  const session = useSession();

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

    // Get viewport-relative coordinates by subtracting scroll position
    const x = e.pageX - window.scrollX;
    const y = e.pageY - window.scrollY;

    // Add bounds checking to keep menu in viewport
    const menuWidth = 192; // w-48 = 12rem = 192px
    const menuHeight = 144; // Approximate height of menu
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust x position if menu would overflow right edge
    const adjustedX = x + menuWidth > viewportWidth ? x - menuWidth : x;
    // Adjust y position if menu would overflow bottom edge
    const adjustedY = y + menuHeight > viewportHeight ? y - menuHeight : y;

    setContextMenu({
      x: adjustedX,
      y: adjustedY,
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
      // Remove product_series from the update data
      const { ...updateData } = updatedItem;

      const response = await fetch("/api/updateStorage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error saving item:", error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);
      const response = await fetch("/api/deleteStorage", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ids: [selectedItem.id] }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // Refresh the page or update the local state
      window.location.reload();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setContextMenu({ ...contextMenu, show: false });
    }
  };

  const handleDeleteClick = () => {
    setContextMenu({ ...contextMenu, show: false });
    setShowDeleteModal(true);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    try {
      setIsDeleting(true);
      const response = await fetch("/api/deleteStorage", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // Refresh the page or update the local state
      window.location.reload();
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("Failed to delete items. Please try again.");
    } finally {
      setIsDeleting(false);
      setSelectedItems(new Set());
      setShowDeleteModal(false);
    }
  };

  // Add handler for selecting all items
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(inventory.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Add handler for selecting individual items
  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Update the existing bulk delete button click handler
  const handleBulkDeleteClick = () => {
    if (selectedItems.size > 1) {
      setShowPreDeleteModal(true);
    } else {
      setShowDeleteModal(true);
    }
  };

  // Add new handler for proceeding to final delete confirmation
  const handleProceedToDelete = () => {
    setShowPreDeleteModal(false);
    setShowDeleteModal(true);
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
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    checked={selectedItems.size === inventory.length}
                    onChange={handleSelectAll}
                  />
                </div>
              </th>
              <th scope="col" className="p-4 text-center w-32">
                Image
              </th>
              <th scope="col" className="p-4 text-left">
                Location
              </th>
              <th scope="col" className="p-4 text-left">
                Event Location
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
                className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                  selectedItems.has(item.id)
                    ? "bg-gray-50 dark:bg-gray-700"
                    : ""
                }`}
                onContextMenu={(e) => handleContextMenu(e, item)}
                style={{ cursor: "context-menu" }}
              >
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </td>
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
                  {item.event_location}
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
            onClick={handleDeleteClick}
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

      {selectedItems.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {selectedItems.size} items selected
          </span>
          <button
            className={`px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600
              ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleBulkDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Selected"}
          </button>
          <button
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            onClick={() => setSelectedItems(new Set())}
            disabled={isDeleting}
          >
            Clear Selection
          </button>
        </div>
      )}

      <PreDeleteConfirmationModal
        isOpen={showPreDeleteModal}
        onClose={() => setShowPreDeleteModal(false)}
        onConfirm={handleProceedToDelete}
        selectedCount={selectedItems.size}
        selectedItems={selectedItems}
        inventory={inventory}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={selectedItems.size > 0 ? handleBulkDelete : handleDelete}
        item={selectedItem}
        items={selectedItems}
        inventory={inventory}
        isDeleting={isDeleting}
        imageUrl={
          selectedItem
            ? signedUrls[selectedItem.product_info?.productImagePath]
            : undefined
        }
      />
    </>
  );
}
