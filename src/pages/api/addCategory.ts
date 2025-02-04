import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Changed to service role key
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

  // Verify authentication (you might want to add more robust auth checking)
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const { series_name } = req.body;

    if (!series_name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category name already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from("product_series")
      .select("id")
      .ilike("series_name", series_name)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return res.status(500).json({
        success: false,
        message: "Error checking for existing category",
      });
    }

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    // If no duplicate found, proceed with insertion
    const { data, error } = await supabase
      .from("product_series")
      .insert([{ series_name }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
