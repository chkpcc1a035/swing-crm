import { useState, useEffect } from "react";
import CategoryProductsModal from "./CategoryProductsModal";
import { useTheme } from "@/components/ThemeProvider";
import { Toast } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";

interface Category {
  id: string;
  series_name: string;
  created_at: string;
  product_count?: number;
}

interface CategoryTableProps {
  categories: Category[];
  onDelete: (ids: string[]) => Promise<void>;
  isDeleting: boolean;
  onRefresh: () => Promise<void>;
}

export default function CategoryTable({
  categories,
  // onDelete,
  isDeleting,
  onRefresh,
}: CategoryTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { darkMode } = useTheme();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    show: boolean;
  }>({ x: 0, y: 0, show: false });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ ...contextMenu, show: false });
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, category: Category) => {
    e.preventDefault();
    setSelectedCategory(category);
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      show: true,
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(categories.map((cat) => cat.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    console.log(newSelected);
    setSelectedItems(newSelected);
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = async () => {
    if (selectedItems.size === 0) {
      showNotification("No categories selected", "error");
      return;
    }

    try {
      const response = await fetch("/api/deleteCategories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryIds: Array.from(selectedItems),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification(
          data.message || "Categories deleted successfully",
          "success"
        );
        setSelectedItems(new Set());
        setShowDeleteModal(false);
        await onRefresh();
      } else {
        throw new Error(data.message || "Failed to delete categories");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to delete categories",
        "error"
      );
    }
  };

  const handleViewProducts = () => {
    setShowProductsModal(true);
    setContextMenu({ ...contextMenu, show: false });
  };

  const handleDeleteClick = () => {
    if (selectedCategory) {
      // Clear any existing selections and set only the current category
      setSelectedItems(new Set([selectedCategory.id]));

      console.log("selectedCategory", selectedCategory);
    }
    setContextMenu({ ...contextMenu, show: false });
    setShowDeleteModal(true);
  };

  return (
    <>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  checked={selectedItems.size === categories.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th scope="col" className="p-4">
                Category Name
              </th>
              <th scope="col" className="p-4">
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                onContextMenu={(e) => handleContextMenu(e, category)}
                style={{ cursor: "context-menu" }}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    checked={selectedItems.has(category.id)}
                    onChange={() => handleSelectItem(category.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="p-4 text-gray-900 dark:text-white">
                  {category.series_name}
                </td>
                <td className="p-4 text-gray-900 dark:text-white">
                  {new Date(category.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      {contextMenu.show && selectedCategory && (
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
            onClick={handleViewProducts}
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
            View Products
          </button>
          <button
            onClick={() => {
              /* Edit category logic */
            }}
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
            Edit Category
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
            Delete Category
          </button>
        </div>
      )}

      {selectedItems.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {selectedItems.size} categories selected
          </span>
          <button
            className={`px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600
              ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => setShowDeleteModal(true)}
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

      {/* Add Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <div className="text-gray-600 dark:text-gray-300 mb-6">
              {selectedItems.size === 1 && selectedCategory ? (
                <>
                  Are you sure you want to delete category &ldquo;
                  {selectedCategory.series_name}&rdquo;? This will also delete
                  all associated inventory items.
                </>
              ) : (
                <>
                  <p className="mb-2">
                    Are you sure you want to delete {selectedItems.size}{" "}
                    categories? This will delete the following categories and
                    all their associated inventory items:
                  </p>
                  <ul className="mt-2 ml-4 list-disc">
                    {Array.from(selectedItems).map((id) => {
                      const category = categories.find((c) => c.id === id);
                      return category ? (
                        <li key={id}>{category.series_name}</li>
                      ) : null;
                    })}
                  </ul>
                </>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600
                  ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCategory && (
        <CategoryProductsModal
          isOpen={showProductsModal}
          onClose={() => {
            setShowProductsModal(false);
            setSelectedCategory(null);
          }}
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.series_name}
        />
      )}

      {/* Flowbite Toast */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50">
          <Toast>
            {toastType === "success" ? (
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiCheck className="h-5 w-5" />
              </div>
            ) : (
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                <HiX className="h-5 w-5" />
              </div>
            )}
            <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            <Toast.Toggle onDismiss={() => setShowToast(false)} />
          </Toast>
        </div>
      )}
    </>
  );
}
