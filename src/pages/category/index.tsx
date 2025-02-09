import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useSession } from "@supabase/auth-helpers-react";
import CategoryTable from "@/components/CategoryTable";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useTheme } from "@/components/ThemeProvider";

interface Category {
  id: string;
  series_name: string;
  created_at: string;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const session = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { darkMode } = useTheme();
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const response = await fetch("/api/fetchCategories");
      const data = await response.json();
      if (data.success) {
        console.log("Categories fetched:", data.data);
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (ids: string[]) => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/deleteCategories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ categoryIds: ids }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }

      // Refresh the categories list after successful deletion
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting categories:", error);
      alert("Failed to delete categories. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setError(""); // Clear any previous errors
      setIsSubmitting(true);
      const response = await fetch("/api/addCategory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ series_name: newCategoryName.trim() }),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.message);
        return;
      }

      // Refresh the categories list after successful addition
      await fetchCategories();
      setNewCategoryName("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const searchLower = searchTerm.toLowerCase();
    return category.series_name.toLowerCase().includes(searchLower);
  });

  return (
    <AppShell>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Category Management</h1>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus /> Add Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className={`block w-full p-2.5 pl-10 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CategoryTable
          categories={filteredCategories}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          onRefresh={fetchCategories}
        />

        {/* Add Category Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`rounded-lg p-6 w-96 shadow-lg border ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-200 text-gray-800"
              }`}
            >
              <h2
                className={`text-xl font-bold mb-4 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Add New Category
              </h2>
              <form onSubmit={handleAddCategory}>
                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value);
                      setError(""); // Clear error when user types
                    }}
                    className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                    } ${error ? "border-red-500" : ""}`}
                    placeholder="Enter category name"
                    required
                  />
                  {error && (
                    <p
                      className={`mt-2 text-sm ${
                        darkMode ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      {error}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800"
                        : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
