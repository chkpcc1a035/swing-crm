import { Inventory } from "@/types";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import {
  FiX,
  FiSave,
  FiDollarSign,
  FiPackage,
  FiInfo,
  FiMapPin,
} from "react-icons/fi";

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
              className={`text-2xl font-bold
              ${darkMode ? "text-gray-100" : "text-gray-900"}`}
            >
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
                <FiInfo />
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
                <FiDollarSign />
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
                      <FiPackage className="w-4 h-4" />
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
                  <label className={labelClassName}>Product Number</label>
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
                <label className={labelClassName}>Description</label>
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
                  <label className={labelClassName}>Category</label>
                  <input
                    type="text"
                    name="product_series.series_name"
                    value={formData.product_series?.series_name || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity || ""}
                    onChange={handleChange}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Stock Quantity</label>
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
                      <FiDollarSign className="w-4 h-4" />
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
                  <label className={labelClassName}>Wholesale Price</label>
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
                  <label className={labelClassName}>Retail Price</label>
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
                  <label className={labelClassName}>Cost Price</label>
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
                <label className={labelClassName}>Delivery Fee</label>
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
    </div>
  );
}
