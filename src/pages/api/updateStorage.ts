import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Check if environment variables are defined
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error("Required environment variables are not set");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: "public",
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set proper content type
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { id, product_info, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    // First, verify the product_series exists if product_series_id is provided
    if (updateData.product_series_id) {
      const { data: seriesExists, error: seriesError } = await supabase
        .from("product_series")
        .select("id")
        .eq("id", updateData.product_series_id)
        .single();

      if (seriesError || !seriesExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid product_series_id",
        });
      }
    }

    // Update inventory record with only the fields that should be updated
    const { data: updatedInventory, error: updateError } = await supabase
      .from("inventory")
      .update({
        stock_location: updateData.stock_location,
        event_location: updateData.event_location,
        sku_number: updateData.sku_number,
        product_number: updateData.product_number,
        product_info: product_info || undefined,
        quantity: updateData.quantity,
        stock_qty: updateData.stock_qty,
        unit_price: updateData.unit_price,
        wholesale_price: updateData.wholesale_price,
        retail_price: updateData.retail_price,
        delivery_fee: updateData.delivery_fee,
        cost_price: updateData.cost_price,
        product_series_id: updateData.product_series_id || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(400).json({
        success: false,
        message: updateError.message,
      });
    }

    // Fetch product series data separately
    const finalData = { ...updatedInventory };
    if (updatedInventory.product_series_id) {
      const { data: seriesData } = await supabase
        .from("product_series")
        .select("id, series_name")
        .eq("id", updatedInventory.product_series_id)
        .single();

      if (seriesData) {
        finalData.product_series = seriesData;
      }
    }

    return res.status(200).json({
      success: true,
      data: finalData,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
