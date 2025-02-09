import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { order_type, from_location, to_location, reference_number, notes } =
      req.body;

    // Create the order with created_by field
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_type,
        from_location,
        to_location,
        reference_number,
        notes,
        order_number: `ORD-${Date.now()}`,
        created_by: user.id,
        metadata: {},
      })
      .select()
      .single();

    if (orderError) {
      console.error("Database error:", orderError);
      return res.status(500).json({
        success: false,
        message: orderError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: orderData,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
}
