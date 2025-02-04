import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Required environment variables are not set");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers if needed
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    // Verify database connection
    const { error: connectionError } = await supabase
      .from("product_series")
      .select("count")
      .limit(1);

    if (connectionError) {
      console.error("Database connection error:", connectionError);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
        error: connectionError.message,
      });
    }

    // Fetch categories
    const { data, error } = await supabase
      .from("product_series")
      .select("id,series_name")
      .order("series_name");

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
        error: error.message,
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
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
