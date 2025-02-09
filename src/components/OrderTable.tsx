import { useState, useEffect, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
// import DeleteConfirmationModal from "./DeleteConfirmationModal";
// import EditOrderModal from "./EditOrderModal";
import { OrderTableProps } from "@/types";

interface OrderTableComponentProps {
  data: OrderTableProps[];
}

export default function OrderTable({
  data: initialData,
}: OrderTableComponentProps) {
  const [data, setData] = useState<OrderTableProps[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const session = useSession();
  // const { darkMode } = useTheme();

  const fetchOrders = useCallback(async () => {
    if (!session) return;

    try {
      setLoading(true);
      console.log("Fetching with token:", session.access_token); // Debug log

      const response = await fetch("/api/fetchOrders", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      console.log("Response status:", response.status); // Debug log

      const result = await response.json();
      console.log("API Response:", result); // Debug log

      if (!result.success) {
        setError(result.message);
        return;
      }

      setData(result.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      setError("Please sign in to view orders");
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [session, fetchOrders]);

  // const handleDelete = async () => {
  //   if (!selectedItem) return;

  //   try {
  //     setIsDeleting(true);
  //     const response = await fetch("/api/deleteOrder", {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${session?.access_token}`,
  //       },
  //       body: JSON.stringify({ id: selectedItem.id }),
  //     });

  //     const result = await response.json();
  //     if (!result.success) {
  //       throw new Error(result.message);
  //     }

  //     window.location.reload();
  //   } catch (error) {
  //     console.error("Error deleting order:", error);
  //     alert("Failed to delete order. Please try again.");
  //   } finally {
  //     setIsDeleting(false);
  //     setShowDeleteModal(false);
  //   }
  // };

  if (!session) {
    return (
      <div className="w-full p-4 text-gray-500 dark:text-gray-400 text-center">
        Please sign in to view orders
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-4 text-gray-500 dark:text-gray-400 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 text-red-500 text-center">Error: {error}</div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-4 text-gray-500 dark:text-gray-400 text-center">
        No orders found
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
                Date
              </th>
              <th scope="col" className="p-4">
                Reference
              </th>
              <th scope="col" className="p-4">
                Type
              </th>
              <th scope="col" className="p-4">
                From
              </th>
              <th scope="col" className="p-4">
                To
              </th>
              <th scope="col" className="p-4">
                Quantity
              </th>
              <th scope="col" className="p-4">
                Unit Price
              </th>
              <th scope="col" className="p-4">
                Total Amount
              </th>
              <th scope="col" className="p-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td className="p-4">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">{item.reference_number}</td>
                <td className="p-4">{item.transaction_type}</td>
                <td className="p-4">{item.from_location}</td>
                <td className="p-4">{item.to_location}</td>
                <td className="p-4">{item.quantity}</td>
                <td className="p-4">${item.unit_price?.toFixed(2)}</td>
                <td className="p-4">${item.total_amount?.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      Edit
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
