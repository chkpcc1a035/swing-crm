import {
  Button,
  Modal,
  Label,
  TextInput,
  Textarea,
  FileInput,
  Toast,
  Select,
} from "flowbite-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/component";
import { useRouter } from "next/navigation";
import { HiCheck, HiX } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";

interface AddStorageItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddStorageItemModal({
  isOpen,
  onClose,
  onSuccess,
}: AddStorageItemModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedImagePath, setUploadedImagePath] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [productSeries, setProductSeries] = useState<
    Array<{ id: string; series_name: string }>
  >([]);

  // Form state
  const [formData, setFormData] = useState({
    sku_number: "",
    product_number: "",
    stock_location: "",
    quantity: "",
    wholesale_price: "",
    cost_price: "",
    delivery_fee: "",
    retail_price: "",
    unit_price: "",
    stock_qty: "",
    description: "",
    product_series_id: "",
  });

  // Replace alerts with toast notifications
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // Update checkAuth function
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showToast("Please sign in to add inventory items", "error");
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  // Fetch product series on modal open
  useEffect(() => {
    const fetchProductSeries = async () => {
      const { data, error } = await supabase
        .from("product_series")
        .select("id, series_name");

      if (data && !error) {
        setProductSeries(data);
      }
    };

    if (isOpen) {
      fetchProductSeries();
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Update handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      showToast("Please sign in to add inventory items", "error");
      router.push("/login");
      return;
    }

    if (!uploadedImagePath) {
      showToast("Please upload an image first", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("inventory")
        .insert([
          {
            sku_number: formData.sku_number,
            product_number: formData.product_number,
            stock_location: formData.stock_location,
            quantity: parseInt(formData.quantity),
            wholesale_price: parseFloat(formData.wholesale_price),
            cost_price: parseFloat(formData.cost_price),
            delivery_fee: parseFloat(formData.delivery_fee),
            unit_price: parseFloat(formData.unit_price),
            retail_price: parseFloat(formData.retail_price),
            stock_qty: parseInt(formData.stock_qty),
            website_status: {
              is_visible: true,
              is_available: true,
            },
            product_info: {
              productImagePath: uploadedImagePath,
              productDescription: formData.description,
            },
            product_series_id: formData.product_series_id || null,
          },
        ])
        .select();

      if (error) throw error;

      showToast("Storage item added successfully!", "success");
      // Reset form and close modal
      setFormData({
        sku_number: "",
        product_number: "",
        stock_location: "",
        quantity: "",
        wholesale_price: "",
        cost_price: "",
        delivery_fee: "",
        retail_price: "",
        unit_price: "",
        stock_qty: "",
        description: "",
        product_series_id: "",
      });
      setSelectedFile(null);
      setPreviewUrl("");
      setUploadedImagePath("");

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      router.push("/storage");
    } catch (error) {
      console.error("Error adding storage item:", error);
      showToast("Failed to add storage item", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create preview URL when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Clean up the URL when component unmounts or file changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Automatically trigger upload
      await uploadImage(file);
    }
  };

  // Update uploadImage to accept a file parameter
  const uploadImage = async (fileToUpload: File = selectedFile!) => {
    if (!fileToUpload) return;

    setIsUploading(true);

    try {
      // Generate unique filename
      const filename = `${Date.now()}-${fileToUpload.name}`;
      const filePath = `products_image/${filename}`;

      // Upload directly to Supabase storage
      const { data, error } = await supabase.storage
        .from("products")
        .upload(filePath, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Store the path for database insertion
      setUploadedImagePath(data.path);
      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Modal
        show={isOpen}
        onClose={onClose}
        position="center"
        size="md"
        popup={false}
        dismissible
        theme={{
          root: {
            base: "fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm",
            positions: {
              center: "flex items-center justify-center",
            },
          },
          content: {
            base: "relative h-full w-full p-0 md:h-auto max-h-[90vh] overflow-y-auto",
            inner:
              "relative rounded-lg bg-white shadow dark:bg-gray-700 flex flex-col max-h-[90vh]",
          },
        }}
      >
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          Add New Storage Item
        </Modal.Header>
        <Modal.Body className="!p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productImage" value="Product Image" />
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="productImage"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      await uploadImage(file);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        className="object-contain w-full h-full p-2"
                        width={100}
                        height={100}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                        <p className="text-white text-sm">
                          Click to change image
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG or JPEG (MAX. 800x400px)
                      </p>
                    </div>
                  )}
                  <FileInput
                    id="productImage"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              </div>
              {selectedFile && !uploadedImagePath && (
                <div className="flex items-center justify-between p-2 mt-2 bg-gray-50 rounded-lg dark:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <Button
                    onClick={() => uploadImage()}
                    disabled={isUploading}
                    className="inline-flex items-center justify-center whitespace-nowrap text-white font-medium rounded-lg text-sm px-5 py-2.5 bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300"
                  >
                    <div className="inline-flex items-center justify-center gap-2 relative top-[0.5px]">
                      {isUploading ? (
                        <>
                          <span className="animate-spin">↻</span>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FaTimes className="h-4 w-4" />
                          <span>Not Uploaded</span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku_number" value="SKU Number" />
                <TextInput
                  id="sku_number"
                  type="text"
                  placeholder="BDSP02002"
                  required
                  value={formData.sku_number}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="product_number" value="Product Number" />
                <TextInput
                  id="product_number"
                  type="text"
                  placeholder="ZCC-12345"
                  required
                  value={formData.product_number}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="stock_location" value="Stock Location" />
                <TextInput
                  id="stock_location"
                  type="text"
                  placeholder="56"
                  required
                  value={formData.stock_location}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="quantity" value="Quantity" />
                <TextInput
                  id="quantity"
                  type="number"
                  placeholder="12"
                  required
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wholesale_price" value="Wholesale Price" />
                <TextInput
                  id="wholesale_price"
                  type="number"
                  placeholder="123"
                  required
                  value={formData.wholesale_price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="cost_price" value="Cost Price" />
                <TextInput
                  id="cost_price"
                  type="number"
                  placeholder="123"
                  required
                  value={formData.cost_price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="delivery_fee" value="Delivery Fee" />
                <TextInput
                  id="delivery_fee"
                  type="number"
                  placeholder="3"
                  required
                  value={formData.delivery_fee}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="retail_price" value="Retail Price" />
                <TextInput
                  id="retail_price"
                  type="number"
                  placeholder="3"
                  required
                  value={formData.retail_price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="unit_price" value="Unit Price" />
                <TextInput
                  id="unit_price"
                  type="number"
                  placeholder="10"
                  required
                  value={formData.unit_price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="stock_qty" value="Stock Quantity" />
                <TextInput
                  id="stock_qty"
                  type="number"
                  placeholder="100"
                  required
                  value={formData.stock_qty}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" value="Product Description" />
              <Textarea
                id="description"
                placeholder="Enter product description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="product_series_id" value="Product Series" />
              <Select
                id="product_series_id"
                value={formData.product_series_id}
                onChange={(e) =>
                  handleInputChange({
                    target: { id: "product_series_id", value: e.target.value },
                  } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
                }
              >
                <option value="">Select a series</option>
                {productSeries.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.series_name}
                  </option>
                ))}
              </Select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 !p-6 dark:border-gray-700">
          <div className="flex flex-col w-full gap-4">
            <Button
              color="dark"
              className="w-full"
              disabled={isUploading || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button
              color="gray"
              onClick={onClose}
              className="w-full"
              disabled={isUploading || isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {toast.show && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <Toast>
            {toast.type === "success" ? (
              <HiCheck className="h-5 w-5 text-green-600" />
            ) : (
              <HiX className="h-5 w-5 text-red-600" />
            )}
            <div className="pl-4 text-sm font-normal">{toast.message}</div>
          </Toast>
        </div>
      )}
    </>
  );
}
