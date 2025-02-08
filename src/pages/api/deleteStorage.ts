import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🚀 Delete API called with method:", req.method);

  if (req.method !== "DELETE") {
    console.log("❌ Invalid method:", req.method);
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    // Get the user's session token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("❌ No authorization header found");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    // Set the auth header for this request
    supabase.auth.setSession({
      access_token: authHeader.replace("Bearer ", ""),
      refresh_token: "",
    });

    const { ids } = req.body;
    console.log("📦 Received request body:", req.body);
    console.log("🎯 IDs to delete:", ids);

    if (!Array.isArray(ids) || ids.length === 0) {
      console.log("❌ Invalid IDs array:", ids);
      return res.status(400).json({
        success: false,
        message: "Invalid request: ids array is required",
      });
    }

    console.log(
      `⏳ Attempting to delete ${ids.length} items from inventory...`
    );
    console.log("🔍 IDs for deletion:", ids);

    // First, verify the records exist
    const { data: existingRecords, error: checkError } = await supabase
      .from("inventory")
      .select("id")
      .in("id", ids);

    if (checkError) {
      console.error("💥 Error checking existing records:", checkError);
      return res.status(500).json({
        success: false,
        message: checkError.message,
        details: checkError,
      });
    }

    console.log("🔍 Found existing records:", existingRecords);

    if (!existingRecords || existingRecords.length !== ids.length) {
      console.log("⚠️ Not all records found:", {
        requested: ids.length,
        found: existingRecords?.length || 0,
      });
    }

    // First, get the records with their image paths before deletion
    const { data: recordsToDelete, error: fetchError } = await supabase
      .from("inventory")
      .select(
        `
        id,
        product_info->productImagePath
      `
      )
      .in("id", ids);

    if (fetchError) {
      console.error("💥 Error fetching records:", fetchError);
      return res.status(500).json({
        success: false,
        message: fetchError.message,
        details: fetchError,
      });
    }

    // Delete images from storage bucket if they exist
    const deleteImagePromises = recordsToDelete
      .filter((record) => record.productImagePath)
      .map(async (record) => {
        const imagePath = record.productImagePath as string;
        if (!imagePath) return;

        const { error: storageError } = await supabase.storage
          .from("products") // replace with your bucket name
          .remove([imagePath]);

        if (storageError) {
          console.error(`💥 Error deleting image ${imagePath}:`, storageError);
        } else {
          console.log(`✅ Successfully deleted image: ${imagePath}`);
        }
      });

    // Wait for all image deletions to complete
    await Promise.all(deleteImagePromises);

    // Proceed with deleting the database records
    const { data, error } = await supabase
      .from("inventory")
      .delete()
      .in("id", ids)
      .select();

    if (error) {
      console.error("💥 Supabase delete error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return res.status(500).json({
        success: false,
        message: error.message,
        details: error,
      });
    }

    // Verify deletion by checking if records still exist
    const { data: remainingRecords, error: verifyError } = await supabase
      .from("inventory")
      .select("id")
      .in("id", ids);

    if (verifyError) {
      console.error("💥 Error verifying deletion:", verifyError);
    } else {
      console.log("🔍 Remaining records after deletion:", remainingRecords);
      if (remainingRecords && remainingRecords.length > 0) {
        console.error("⚠️ Some records were not deleted:", remainingRecords);
      }
    }

    console.log("✅ Delete operation completed:", {
      deletedCount: data?.length || 0,
      deletedIds: ids,
      deletedRecords: data,
      remainingRecords: remainingRecords || [],
    });

    return res.status(200).json({
      success: remainingRecords?.length === 0,
      message:
        remainingRecords?.length === 0
          ? `Successfully deleted ${ids.length} items`
          : "Some items could not be deleted",
      deletedIds: ids,
      deletedRecords: data,
      remainingRecords: remainingRecords,
    });
  } catch (error) {
    console.error("💥 Server error:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    // Log additional request context in case of error
    console.error("📝 Request context:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
    });

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorDetails:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack:
                process.env.NODE_ENV === "development"
                  ? error.stack
                  : undefined,
            }
          : error,
    });
  }
}
