import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Modal, Button } from "flowbite-react";
import { useDebounce } from "use-debounce";
import { AddOrderModalProps, InventoryDetails, OrderItem } from "@/types";

export default function AddOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: AddOrderModalProps) {
  const session = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  );
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [searchResults, setSearchResults] = useState<InventoryDetails[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      inventory_id: "",
      inventory_details: null,
      quantity: "",
      unit_price: "",
    },
  ]);
  const [formData, setFormData] = useState({
    order_type: "purchase",
    from_location: "",
    to_location: "",
    reference_number: "",
    notes: "",
  });

  useEffect(() => {
    const fetchInventory = async () => {
      if (!debouncedSearch) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/fetchInventory?search=${encodeURIComponent(debouncedSearch)}`,
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [debouncedSearch, session?.access_token]);

  const handleSelectInventory = (
    index: number,
    inventory: InventoryDetails
  ) => {
    const newItems = [...orderItems];
    newItems[index] = {
      inventory_id: inventory.id,
      inventory_details: inventory,
      quantity: "",
      unit_price: inventory.unit_price || "",
    };
    setOrderItems(newItems);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      {
        inventory_id: "",
        inventory_details: null,
        quantity: "",
        unit_price: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/addOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          items: orderItems,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Failed to add order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchFocus = (index: number) => {
    setActiveSearchIndex(index);
    setShowDropdown(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      setActiveSearchIndex(null);
    }, 200);
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>Add Order</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4" id="orderForm">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Order Type
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              value={formData.order_type}
              onChange={(e) =>
                setFormData({ ...formData, order_type: e.target.value })
              }
            >
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="transfer">Transfer</option>
              <option value="return">Return</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              From Location
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              value={formData.from_location}
              onChange={(e) =>
                setFormData({ ...formData, from_location: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              To Location
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              value={formData.to_location}
              onChange={(e) =>
                setFormData({ ...formData, to_location: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reference Number
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              value={formData.reference_number}
              onChange={(e) =>
                setFormData({ ...formData, reference_number: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Order Items</h3>
              <Button size="sm" onClick={handleAddItem}>
                Add Item
              </Button>
            </div>
            {orderItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-end">
                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium">
                    Search Inventory
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Search by SKU, Product Number, Description, or Location"
                    value={
                      activeSearchIndex === index
                        ? searchTerm
                        : item.inventory_details?.sku_number || ""
                    }
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => handleSearchFocus(index)}
                    onBlur={handleSearchBlur}
                  />
                  {showDropdown &&
                    activeSearchIndex === index &&
                    searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((result: InventoryDetails) => (
                          <div
                            key={result.id}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => handleSelectInventory(index, result)}
                          >
                            <div className="font-medium">
                              {result.sku_number} - {result.product_number}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                              {result.product_info?.productDescription}
                            </div>
                            <div className="text-xs text-gray-400">
                              Location: {result.stock_location} • Stock:{" "}
                              {result.quantity}
                            </div>
                            <div className="text-xs text-gray-400">
                              Price: ${result.unit_price} (Retail: $
                              {result.retail_price})
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {isLoading && activeSearchIndex === index && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  )}
                </div>

                {item.inventory_details && (
                  <div className="text-sm text-gray-500 dark:text-gray-300 space-y-1">
                    <div>SKU: {item.inventory_details.sku_number}</div>
                    <div>
                      Product Number: {item.inventory_details.product_number}
                    </div>
                    <div>
                      Description:{" "}
                      {item.inventory_details.product_info?.productDescription}
                    </div>
                    <div>Location: {item.inventory_details.stock_location}</div>
                    <div>
                      Available Stock: {item.inventory_details.quantity}
                    </div>
                    <div>Unit Price: ${item.inventory_details.unit_price}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium">Quantity</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleItemChange(index, "unit_price", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} form="orderForm">
          {isSubmitting ? "Adding..." : "Add Order"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
