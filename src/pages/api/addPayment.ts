// import { createClient } from "@/utils/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient, PostgrestError } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const {
      order_type,
      from_location,
      to_location,
      reference_number,
      notes,
      items,
    } = req.body;

    console.log("Received items:", items);
    console.log("Request body:", req.body);

    // First, create the order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_type,
        from_location,
        to_location,
        reference_number,
        notes,
        order_number: `ORD-${Date.now()}`, // Generate a unique order number
        metadata: {},
      })
      .select()
      .single();

    if (orderError) throw orderError;
    console.log("Created order:", orderData);

    // Then, create the order items
    const orderItems = items.map(
      (item: {
        inventory_id: string;
        quantity: number;
        unit_price: number;
      }) => {
        console.log("Processing item:", item);
        return {
          order_id: orderData.id,
          inventory_id: item.inventory_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
          metadata: {},
        };
      }
    );

    console.log("Prepared order items:", orderItems);

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return res.status(200).json({ success: true, data: orderData });
  } catch (error) {
    console.error("Error adding order:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      code: error instanceof Error ? (error as PostgrestError).code : "Unknown",
      details:
        error instanceof Error ? (error as PostgrestError).details : "Unknown",
    });
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error: error instanceof Error ? error : "Unknown error",
    });
  }
}
