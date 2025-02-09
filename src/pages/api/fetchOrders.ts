import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for the API route using service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key instead of anon key
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    // Get the session from the request
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader); // Debug log

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

    console.log("Auth User:", user); // Debug log
    console.log("Auth Error:", authError); // Debug log

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Fetch all orders using service role (bypasses RLS)
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Orders Query Result:", { orders, error }); // Debug log

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    console.log("Orders:", orders);

    return res.status(200).json({
      success: true,
      data: orders || [],
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}
