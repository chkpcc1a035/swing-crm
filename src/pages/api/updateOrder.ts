import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const {
      id,
      transaction_type,
      quantity,
      unit_price,
      from_location,
      to_location,
      reference_number,
      notes,
    } = req.body;

    const total_amount = quantity * unit_price;

    const { data, error } = await supabase
      .from("inventory_transactions")
      .update({
        transaction_type,
        quantity: parseInt(quantity),
        unit_price: parseFloat(unit_price),
        total_amount,
        from_location,
        to_location,
        reference_number,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
