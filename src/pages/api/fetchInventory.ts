import { NextApiRequest, NextApiResponse } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const searchTerm = req.query.search as string;

    // First fetch all data
    const { data, error } = await supabase.from("inventory").select(`
        id,
        sku_number,
        product_number,
        product_info,
        stock_location,
        quantity,
        unit_price,
        wholesale_price,
        retail_price,
        product_series (
          id,
          series_name
        )
      `);

    if (error) throw error;

    // Then filter on the server side
    const filteredData = data
      ?.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.sku_number?.toLowerCase().includes(searchLower) ||
          item.product_number?.toLowerCase().includes(searchLower) ||
          item.stock_location?.toLowerCase().includes(searchLower) ||
          item.product_info?.productDescription
            ?.toLowerCase()
            .includes(searchLower) ||
          item.product_info?.productName?.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, 10);

    return res.status(200).json({ success: true, data: filteredData });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
