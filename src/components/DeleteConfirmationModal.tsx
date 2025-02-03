import { Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Inventory } from "@/types";
import Image from "next/image";
import { useState, useEffect } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: Inventory | null;
  isDeleting: boolean;
  imageUrl?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  isDeleting,
  imageUrl,
}: DeleteConfirmationModalProps) {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when modal opens/closes or item changes
  useEffect(() => {
    setImageError(false);
  }, [isOpen, item]);

  const renderImage = () => {
    if (imageError || !imageUrl) {
      return (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-2xl">?</span>
        </div>
      );
    }

    return (
      <Image
        src={imageUrl}
        alt={item?.product_info?.productDescription || "Product image"}
        fill
        className="object-cover rounded-md"
        sizes="64px"
        onError={() => setImageError(true)}
        unoptimized
      />
    );
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md" popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this item?
          </h3>
          {item && (
            <div className="mb-5 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  {renderImage()}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.product_info?.productDescription}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    SKU: {item.sku_number}
                  </p>
                  {item.product_series?.series_name && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Series: {item.product_series.series_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Yes, delete it"}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-4 py-2 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              No, cancel
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
