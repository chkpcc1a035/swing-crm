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
  console.debug("DELETE categories request received:", {
    method: req.method,
    body: req.body,
    headers: req.headers,
  });

  if (req.method !== "DELETE") {
    console.debug("Invalid method:", req.method);
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { categoryIds } = req.body;
  console.debug("Attempting to delete categories:", categoryIds);

  if (!categoryIds || !Array.isArray(categoryIds)) {
    console.debug("Invalid categoryIds:", categoryIds);
    return res.status(400).json({
      success: false,
      message: "Invalid request: categoryIds array is required",
    });
  }

  try {
    // 1. First verify the categories and get related inventory
    const { data: existingCategories, error: checkError } = await supabase
      .from("product_series")
      .select(
        `
        id,
        series_name,
        inventory (
          id
        )
      `
      )
      .in("id", categoryIds);

    if (checkError) {
      console.error("Error checking categories:", checkError);
      throw checkError;
    }

    if (!existingCategories?.length) {
      console.debug("No categories found with IDs:", categoryIds);
      return res.status(404).json({
        success: false,
        message: "Categories not found",
      });
    }

    console.debug("Found categories with inventory:", existingCategories);

    // 2. Delete inventory records first
    const inventoryIds = existingCategories
      .flatMap((cat) => cat.inventory)
      .map((inv) => inv.id);

    if (inventoryIds.length > 0) {
      console.debug("Deleting inventory records:", inventoryIds);
      const { error: inventoryDeleteError } = await supabase
        .from("inventory")
        .delete()
        .in("id", inventoryIds);

      if (inventoryDeleteError) {
        console.error("Error deleting inventory:", inventoryDeleteError);
        throw inventoryDeleteError;
      }
      console.debug("Successfully deleted inventory records");
    }

    // 3. Use raw SQL to delete categories
    console.debug("Attempting raw SQL deletion for categories:", categoryIds);
    const { error: rawDeleteError } = await supabase.rpc(
      "delete_product_series",
      {
        category_ids: categoryIds,
      }
    );

    if (rawDeleteError) {
      console.error("Error in raw SQL deletion:", rawDeleteError);
      throw rawDeleteError;
    }

    // 4. Final verification
    const { data: verifyCategories, error: verifyError } = await supabase
      .from("product_series")
      .select("id")
      .in("id", categoryIds);

    if (verifyError) {
      console.error("Error verifying deletion:", verifyError);
      throw verifyError;
    }

    if (verifyCategories && verifyCategories.length > 0) {
      const remainingIds = verifyCategories.map((c) => c.id);
      console.error("Categories still exist after raw deletion:", remainingIds);
      return res.status(500).json({
        success: false,
        message: "Failed to delete categories",
        remainingCategories: remainingIds,
      });
    }

    console.log("Successfully deleted categories and their inventory");
    return res.status(200).json({
      success: true,
      message: "Categories and related inventory deleted successfully",
      deletedCategories: categoryIds,
    });
  } catch (error) {
    console.error("Error in deletion process:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
