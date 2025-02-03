import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for the API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log request method for debugging
  // console.log("Request method:", req.method);

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    // First, let's check if the product_series table has data
    const { data: seriesData, error: seriesError } = await supabase
      .from("product_series")
      .select("*");

    // Log product_series table data
    console.log("Product Series Table Data:", seriesData);

    // Then perform our main query
    const { data, error } = await supabase.from("inventory").select(`
        *,
        product_series (
          series_name
        )
      `);

    // Log the full response for debugging
    // console.log("Full Supabase Response:", { data, error });

    if (error || seriesError) {
      console.error("Supabase error:", error || seriesError);
      return res.status(500).json({
        success: false,
        message: (error || seriesError)?.message,
        details: error || seriesError,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
