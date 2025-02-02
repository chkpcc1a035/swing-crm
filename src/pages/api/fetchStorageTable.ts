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
  console.log("Request method:", req.method);

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    // Log that we're starting the query
    console.log("Starting Supabase query");

    const { data, error } = await supabase.from("inventory").select(`
        *,
        product_series (
          *
        )
      `);

    // Log the response for debugging
    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
        details: error,
      });
    }

    // Always return a success response with data (empty array if no data)
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
