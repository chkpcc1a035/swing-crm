import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Missing filename" });
  }

  // Use service role key for admin access to storage
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Important: use service role key, not anon key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const path = `products_image/${filename}`;
    const { data, error } = await supabase.storage
      .from("products")
      .createSignedUrl(path, 3600);

    if (error) throw error;
    return res.json({ url: data.signedUrl });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Failed to get signed URL" });
  }
}
