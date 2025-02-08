import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Make sure this matches your .env variable
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Function to sanitize filename
const sanitizeFilename = (filename: string): string => {
  // Remove special characters and spaces, transliterate non-Latin characters
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-zA-Z0-9.-]/g, "-") // Replace special chars with hyphen
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .toLowerCase();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    console.debug("file", fields);
    if (!file || typeof file === "string") {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const fileContent = await fs.promises.readFile(file.filepath);

    // Sanitize the original filename
    const sanitizedOriginalFilename = sanitizeFilename(
      file.originalFilename || file.newFilename || "upload"
    );
    const filename = `${Date.now()}-${sanitizedOriginalFilename}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(`products_image/${filename}`, fileContent, {
        contentType: file.mimetype || "image/jpeg",
        cacheControl: "3600",
        upsert: true, // Changed to true to allow overwriting
      });

    console.debug("data", data);
    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    // Clean up temp file
    await fs.promises.unlink(file.filepath);

    return res.status(200).json({
      success: true,
      filename: filename,
      path: `products_image/${filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    });
  }
}
