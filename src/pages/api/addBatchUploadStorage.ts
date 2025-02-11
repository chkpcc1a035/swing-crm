import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import formidable from "formidable";
import { promises as fs } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Create Supabase client with service role key for admin operations
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key instead of anon key
);

interface InventoryRow {
  [key: string]: string | number | null;
}

function cleanFieldName(field: string): string {
  // Remove any trailing newlines and whitespace
  return field.replace(/\n/g, "").trim();
}

function decodeText(text: string): string {
  try {
    // Handle cases where the text is already properly encoded
    if (text.includes("\u0000")) {
      // Remove null bytes that might cause encoding issues
      text = text.replace(/\u0000/g, "");
    }

    // Try to decode as UTF-8
    const decoded = new TextDecoder("utf-8").decode(
      new TextEncoder().encode(text)
    );
    return decoded.trim();
  } catch (error) {
    console.error("Decoding error:", error);
    return text.trim();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API handler started", {
    method: req.method,
    headers: req.headers,
    contentType: req.headers["content-type"],
  });

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("Initializing formidable...");
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    console.log("Parsing form data...");
    const parseResult = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parse error:", err);
          reject(err);
          return;
        }
        resolve({ fields, files });
      });
    });

    const { files } = parseResult as {
      files: { file: formidable.File[] };
    };

    console.log("Form parse complete. Files received:", {
      fileKeys: Object.keys(files),
      fileDetails: files?.file?.[0],
      totalFiles: files ? Object.keys(files).length : 0,
    });

    const file = files?.file?.[0];

    if (!file || !file.filepath) {
      console.error("File validation failed:", {
        fileExists: !!file,
        fileType: file?.mimetype,
        originalFilename: file?.originalFilename,
        filepath: file?.filepath,
      });
      return res.status(400).json({
        success: false,
        message: "No file provided",
        debug: {
          fileExists: !!file,
          fileType: file?.mimetype,
          originalFilename: file?.originalFilename,
        },
      });
    }

    console.log("Valid file found:", {
      type: file.mimetype,
      name: file.originalFilename,
      path: file.filepath,
      size: file.size,
    });

    const fileData = await fs.readFile(file.filepath);
    console.log("File read complete, size:", fileData.length);

    // Handle both CSV and Excel files
    let workbook;
    if (file.mimetype === "text/csv") {
      console.log("Processing CSV file...");
      workbook = XLSX.read(fileData, {
        type: "buffer",
        raw: true,
        codepage: 65001,
        cellDates: true,
        dateNF: "yyyy-mm-dd",
      });
    } else {
      console.log("Processing Excel file...");
      workbook = XLSX.read(fileData, {
        type: "buffer",
        codepage: 65001,
        cellDates: true,
        dateNF: "yyyy-mm-dd",
      });
    }

    console.log("Workbook parsed:", {
      sheetNames: workbook.SheetNames,
      sheetCount: workbook.SheetNames.length,
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    console.log("Converting sheet to JSON...");
    const rawJsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: null,
    });

    console.log("JSON conversion complete, rows:", rawJsonData.length);

    // Clean and decode the data
    console.log("Processing rows...");
    const jsonData = (rawJsonData as InventoryRow[]).map(
      (row: InventoryRow) => {
        const cleanedRow: InventoryRow = {};
        for (const [key, value] of Object.entries(row)) {
          const cleanKey = cleanFieldName(key);
          const cleanValue =
            typeof value === "string" ? decodeText(value) : value;
          cleanedRow[cleanKey] = cleanValue;
        }
        return cleanedRow;
      }
    );

    console.log(`Processing ${jsonData.length} items...`);

    // Process each row
    for (const item of jsonData) {
      console.log("Processing item:", {
        product_number: item.product_number || item["產品編號Product Number"],
        sku: item.sku_number || item["產品編號SKU Number"],
      });

      // Map Chinese field names to English if needed
      const mappedItem = {
        sku_number: item.sku_number || item["產品編號SKU Number"],
        product_number: item.product_number || item["產品編號Product Number"],
        stock_location: item.stock_location || item["庫存位置Stock Location"],
        event_location: item.event_location || item["市集位置"],
        quantity: parseInt(
          String(item.quantity || item["數量Quantity"] || "0")
        ),
        wholesale_price: parseFloat(
          String(item.wholesale_price || item["批發價Wholesale Price"] || "0")
        ),
        cost_price: parseFloat(
          String(item.cost_price || item["成本價Cost Price"] || "0")
        ),
        delivery_fee: parseFloat(
          String(item.delivery_fee || item["運費Delivery Fee"] || "0")
        ),
        retail_price: parseFloat(
          String(item.retail_price || item["零售價Retail Price"] || "0")
        ),
        unit_price: parseFloat(
          String(item.unit_price || item["單價Unit Price"] || "0")
        ),
        stock_qty: parseInt(
          String(item.stock_qty || item["庫存數量Stock Quantity"] || "0")
        ),
        description:
          item.description || item["產品描述Product Description"] || "",
        series_name:
          item["產品系列Product Series"] || item.product_series || "",
      };

      // Skip if product_number is missing
      if (!mappedItem.product_number) {
        console.warn("Skipping row: Missing product_number");
        continue;
      }

      let product_series_id = null;

      // Handle product series if series_name is provided
      if (mappedItem.series_name) {
        // Try to find existing product series
        const { data: existingSeries, error: seriesQueryError } = await supabase
          .from("product_series")
          .select("id")
          .eq("series_name", mappedItem.series_name)
          .single();

        if (seriesQueryError && seriesQueryError.code !== "PGRST116") {
          // PGRST116 is "not found" error
          throw seriesQueryError;
        }

        if (existingSeries) {
          product_series_id = existingSeries.id;
        } else {
          // Insert new product series
          const { data: newSeries, error: seriesInsertError } = await supabase
            .from("product_series")
            .insert([{ series_name: mappedItem.series_name }])
            .select("id")
            .single();

          if (seriesInsertError) throw seriesInsertError;
          product_series_id = newSeries.id;
        }
      }

      // Upsert inventory using product_number as the key
      const { error: inventoryError } = await supabase.from("inventory").upsert(
        {
          product_number: mappedItem.product_number,
          sku_number: mappedItem.sku_number,
          stock_location: mappedItem.stock_location,
          quantity: mappedItem.quantity,
          wholesale_price: mappedItem.wholesale_price,
          cost_price: mappedItem.cost_price,
          delivery_fee: mappedItem.delivery_fee,
          retail_price: mappedItem.retail_price,
          unit_price: mappedItem.unit_price,
          stock_qty: mappedItem.stock_qty,
          website_status: {
            is_visible: true,
            is_available: true,
          },
          product_info: {
            productDescription: mappedItem.description,
          },
          product_series_id: product_series_id,
        },
        {
          onConflict: "product_number",
          ignoreDuplicates: false,
        }
      );

      if (inventoryError) {
        console.error("Error upserting inventory:", inventoryError);
        throw inventoryError;
      }
    }

    // Clean up temporary file
    console.log("Cleaning up temporary file...");
    await fs.unlink(file.filepath);

    console.log("Processing complete");
    return res.status(200).json({
      success: true,
      message: "File processed successfully",
      count: jsonData.length,
    });
  } catch (error) {
    console.error("Batch upload error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process file",
    });
  }
}
