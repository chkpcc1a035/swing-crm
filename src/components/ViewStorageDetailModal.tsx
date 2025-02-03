import { Inventory } from "@/types";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import {
  FiX,
  FiEdit,
  FiPackage,
  FiHash,
  FiMapPin,
  FiTag,
  FiBox,
  FiDatabase,
  FiDollarSign,
  FiTruck,
  FiShoppingCart,
  FiCreditCard,
  FiImage,
} from "react-icons/fi";

interface ViewStorageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Inventory | null;
  onEdit?: (item: Inventory) => void;
}

export default function ViewStorageDetailModal({
  isOpen,
  onClose,
  item,
  onEdit,
}: ViewStorageDetailModalProps) {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const { darkMode } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

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
    const fetchSignedUrl = async () => {
      if (item?.product_info?.productImagePath) {
        try {
          const filename = item.product_info.productImagePath.split("/").pop();
          const response = await fetch(
            `/api/getSignedURL?filename=${filename}`
          );
          const data = await response.json();
          setSignedUrl(data.url);
        } catch (err) {
          console.error("Error fetching signed URL:", err);
        }
      }
    };

    if (isOpen && item) {
      fetchSignedUrl();
    }
  }, [isOpen, item]);

  // Add escape key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`max-w-2xl w-full m-4 rounded-lg shadow-lg border
          ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-200 text-gray-800"
          }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-xl font-bold flex items-center gap-2
              ${darkMode ? "text-gray-100" : "text-gray-900"}`}
            >
              <FiPackage className="w-5 h-5" />
              Item Details
            </h2>
            <button
              onClick={onClose}
              className={`rounded-lg p-1 transition-colors
                ${
                  darkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <FiHash className="w-4 h-4" />
                  SKU Number
                </p>
                <p>{item?.sku_number}</p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <FiTag className="w-4 h-4" />
                  Product Number
                </p>
                <p>{item?.product_number}</p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <FiMapPin className="w-4 h-4" />
                  Location
                </p>
                <p>{item?.stock_location}</p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <FiBox className="w-4 h-4" />
                  Category
                </p>
                <p>{item?.product_series?.series_name || "-"}</p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <FiDatabase className="w-4 h-4" />
                  Quantity
                </p>
                <p>{item?.quantity}</p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="font-semibold flex items-center gap-2 mb-1">
                  <FiBox className="w-4 h-4" />
                  Stock Quantity
                </p>
                <p>{item?.stock_qty}</p>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <p className="font-semibold flex items-center gap-2 mb-1">
                <FiTag className="w-4 h-4" />
                Description
              </p>
              <p>{item?.product_info?.productDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-3 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <p className="font-semibold flex items-center gap-2 mb-3">
                  <FiDollarSign className="w-4 h-4" />
                  Pricing Information
                </p>
                <div className="relative overflow-x-auto">
                  <table
                    className={`w-full text-sm text-left 
                    ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <thead
                      className={`text-xs uppercase 
                      ${
                        darkMode
                          ? "bg-gray-800 text-gray-300"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <tr>
                        <th scope="col" className="px-4 py-2">
                          Type
                        </th>
                        <th scope="col" className="px-4 py-2 text-right">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className={`border-b ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <th
                          scope="row"
                          className="px-4 py-2 font-medium flex items-center gap-2"
                        >
                          <FiTag className="w-3 h-3" />
                          Unit Price
                        </th>
                        <td className="px-4 py-2 text-right">
                          ${item?.unit_price?.toFixed(2)}
                        </td>
                      </tr>
                      <tr
                        className={`border-b ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <th
                          scope="row"
                          className="px-4 py-2 font-medium flex items-center gap-2"
                        >
                          <FiShoppingCart className="w-3 h-3" />
                          Wholesale
                        </th>
                        <td className="px-4 py-2 text-right">
                          ${item?.wholesale_price?.toFixed(2)}
                        </td>
                      </tr>
                      <tr
                        className={`border-b ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <th
                          scope="row"
                          className="px-4 py-2 font-medium flex items-center gap-2"
                        >
                          <FiCreditCard className="w-3 h-3" />
                          Retail
                        </th>
                        <td className="px-4 py-2 text-right">
                          ${item?.retail_price?.toFixed(2)}
                        </td>
                      </tr>
                      <tr
                        className={`border-b ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <th
                          scope="row"
                          className="px-4 py-2 font-medium flex items-center gap-2"
                        >
                          <FiDollarSign className="w-3 h-3" />
                          Cost Price
                        </th>
                        <td className="px-4 py-2 text-right">
                          ${item?.cost_price?.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <th
                          scope="row"
                          className="px-4 py-2 font-medium flex items-center gap-2"
                        >
                          <FiTruck className="w-3 h-3" />
                          Delivery Fee
                        </th>
                        <td className="px-4 py-2 text-right">
                          ${item?.delivery_fee?.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                className={`flex justify-center items-start p-3 rounded-lg 
                ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
              >
                <div className="space-y-2">
                  <p className="font-semibold flex items-center gap-2 mb-1">
                    <FiImage className="w-4 h-4" />
                    Product Image
                  </p>
                  <Image
                    src={signedUrl || "/placeholder.png"}
                    alt={
                      item?.product_info?.productDescription || "Product image"
                    }
                    width={160}
                    height={160}
                    className="w-40 h-40 object-contain rounded-lg"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => item && onEdit?.(item)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              <FiEdit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                ${
                  darkMode
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
            >
              <FiX className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
