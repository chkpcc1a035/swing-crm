import { Inventory } from "@/types";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useSession } from "@supabase/auth-helpers-react";
import {
  FiX,
  FiSave,
  FiDollarSign,
  FiPackage,
  FiInfo,
  FiMapPin,
  FiHash,
  FiTag,
  FiBox,
  FiDatabase,
  FiShoppingCart,
  FiCreditCard,
  FiTruck,
  FiEdit,
  FiGrid,
  FiPlus,
} from "react-icons/fi";

interface ProductSeries {
  id: number;
  series_name: string;
}

interface EditStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Inventory | null;
  onSave: (updatedItem: Inventory) => Promise<void>;
}

export default function EditStorageModal({
  isOpen,
  onClose,
  item,
  onSave,
}: EditStorageModalProps) {
  const { darkMode } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Partial<Inventory>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [categories, setCategories] = useState<ProductSeries[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/getCategories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add auth header if needed
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`,
            }),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Response was not JSON");
        }

        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          console.error("API Error:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Optionally show user-friendly error message
        // alert("Failed to load categories. Please try again.");
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, session?.access_token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsLoading(true);
    try {
      await onSave({ ...item, ...formData });
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const inputClassName = `w-full p-3 rounded-lg border ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
      : "bg-white border-gray-300 focus:border-blue-500"
  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors`;

  const labelClassName = "block mb-2 font-medium text-sm";

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    setIsAddingCategory(true);
    try {
      const response = await fetch("/api/addCategory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ series_name: newCategory.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setFormData((prev) => ({
          ...prev,
          product_series: data.data,
        }));
        setNewCategory("");
      } else {
        alert(data.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`max-w-4xl w-full m-4 rounded-lg shadow-lg border
          ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-200 text-gray-800"
          }`}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-2xl font-bold flex items-center gap-2
                ${darkMode ? "text-gray-100" : "text-gray-900"}`}
            >
              <FiEdit className="w-6 h-6" />
              Edit Inventory Item
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg p-2 transition-colors
                ${
                  darkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="flex mb-6 border-b space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`pb-3 px-4 font-medium transition-colors relative
                ${
                  activeTab === "basic"
                    ? darkMode
                      ? "text-blue-400"
                      : "text-blue-600"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
            >
              <div className="flex items-center gap-2">
                <FiPackage className="w-4 h-4" />
                Basic Information
              </div>
              {activeTab === "basic" && (
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 
                  ${darkMode ? "bg-blue-400" : "bg-blue-600"}`}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pricing")}
              className={`pb-3 px-4 font-medium transition-colors relative
                ${
                  activeTab === "pricing"
                    ? darkMode
                      ? "text-blue-400"
                      : "text-blue-600"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
            >
              <div className="flex items-center gap-2">
                <FiDollarSign className="w-4 h-4" />
                Pricing Details
              </div>
              {activeTab === "pricing" && (
                <div
                  className={`absolute bottom-0 left-0 w-full h-0.5 
                  ${darkMode ? "bg-blue-400" : "bg-blue-600"}`}
                />
              )}
            </button>
          </div>

          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiHash className="w-4 h-4" />
                      SKU Number
                    </div>
                  </label>
                  <input
                    type="text"
                    name="sku_number"
                    value={formData.sku_number || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiTag className="w-4 h-4" />
                      Product Number
                    </div>
                  </label>
                  <input
                    type="text"
                    name="product_number"
                    value={formData.product_number || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>
                  <div className="flex items-center gap-2">
                    <FiInfo className="w-4 h-4" />
                    Description
                  </div>
                </label>
                <input
                  type="text"
                  name="product_info.productDescription"
                  value={formData.product_info?.productDescription || ""}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4" />
                      Location
                    </div>
                  </label>
                  <input
                    type="text"
                    name="stock_location"
                    value={formData.stock_location || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiGrid className="w-4 h-4" />
                      Category
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="product_series"
                      value={formData.product_series_id || ""}
                      onChange={(e) => {
                        const selectedCategory = categories.find(
                          (cat) => cat.id.toString() === e.target.value
                        );
                        setFormData((prev) => ({
                          ...prev,
                          product_series_id: selectedCategory
                            ? selectedCategory.id.toString()
                            : undefined,
                        }));
                      }}
                      className={`${inputClassName} flex-1`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.series_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className={`px-3 rounded-lg transition-colors
                        ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiDatabase className="w-4 h-4" />
                      Quantity
                    </div>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiBox className="w-4 h-4" />
                      Stock Quantity
                    </div>
                  </label>
                  <input
                    type="number"
                    name="stock_qty"
                    value={formData.stock_qty || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiTag className="w-4 h-4" />
                      Unit Price
                    </div>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="unit_price"
                    value={formData.unit_price || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiShoppingCart className="w-4 h-4" />
                      Wholesale Price
                    </div>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="wholesale_price"
                    value={formData.wholesale_price || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4" />
                      Retail Price
                    </div>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="retail_price"
                    value={formData.retail_price || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4" />
                      Cost Price
                    </div>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost_price"
                    value={formData.cost_price || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>
                  <div className="flex items-center gap-2">
                    <FiTruck className="w-4 h-4" />
                    Delivery Fee
                  </div>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="delivery_fee"
                  value={formData.delivery_fee || ""}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2
                ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <FiSave className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2
                ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
            >
              <FiX className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>

      {isAddingCategory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`p-6 rounded-lg shadow-lg max-w-md w-full mx-4 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className={`text-lg font-bold mb-4 ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Add New Category
            </h3>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={inputClassName}
              placeholder="Enter category name"
              onMouseDown={(e) => e.stopPropagation()}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsAddingCategory(false);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleAddCategory}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
