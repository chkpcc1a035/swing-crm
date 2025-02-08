import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { data, error } = await supabase
      .from("product_series")
      .select("*")
      .order("series_name");

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch categories",
    });
  }
}
