import { Modal } from "flowbite-react";
import { HiOutlineShieldExclamation } from "react-icons/hi";
import { Inventory } from "@/types";

interface PreDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  selectedItems: Set<string>;
  inventory: Inventory[];
}

export default function PreDeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  selectedItems,
  inventory,
}: PreDeleteConfirmationModalProps) {
  return (
    <Modal show={isOpen} onClose={onClose} size="md" popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiOutlineShieldExclamation className="mx-auto mb-4 h-14 w-14 text-yellow-400" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            You are about to delete {selectedCount} items
          </h3>
          <div className="mb-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Selected items for deletion:
            </p>
            <div className="max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {Array.from(selectedItems).map((id) => {
                  const item = inventory.find((i) => i.id === id);
                  return (
                    <div
                      key={id}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-left"
                    >
                      <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {item?.product_info?.productDescription}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>SKU: {item?.sku_number}</span>
                        <span>Qty: {item?.quantity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800"
            >
              Proceed to Delete
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
