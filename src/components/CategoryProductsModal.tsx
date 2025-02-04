import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Product {
  id: string;
  sku_number: string;
  product_number: string;
  product_info: {
    productDescription: string;
    productImagePath: string;
  };
  quantity: number;
  stock_qty: number;
  unit_price: number;
}

interface CategoryProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
}

export default function CategoryProductsModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
}: CategoryProductsModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();
      // Add event listener for escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, categoryId]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/fetchCategoryProducts?categoryId=${categoryId}`
      );
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
        fetchSignedUrls(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSignedUrls = async (products: Product[]) => {
    const urls: Record<string, string> = {};
    for (const product of products) {
      if (product.product_info?.productImagePath) {
        try {
          const filename = product.product_info.productImagePath
            .split("/")
            .pop();
          const response = await fetch(
            `/api/getSignedURL?filename=${filename}`
          );
          const data = await response.json();
          urls[product.product_info.productImagePath] = data.url;
        } catch (err) {
          console.error("Error fetching signed URL:", err);
        }
      }
    }
    setSignedUrls(urls);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg w-11/12 max-w-6xl max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2
              id="modal-title"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Products in {categoryName}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No products found in this category
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="p-4">
                    Image
                  </th>
                  <th scope="col" className="p-4">
                    SKU
                  </th>
                  <th scope="col" className="p-4">
                    Product Number
                  </th>
                  <th scope="col" className="p-4">
                    Description
                  </th>
                  <th scope="col" className="p-4 text-right">
                    Quantity
                  </th>
                  <th scope="col" className="p-4 text-right">
                    Stock Qty
                  </th>
                  <th scope="col" className="p-4 text-right">
                    Unit Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="p-4">
                      <Image
                        src={
                          signedUrls[product.product_info?.productImagePath] ||
                          "/placeholder.png"
                        }
                        alt={product.product_info?.productDescription || ""}
                        width={50}
                        height={50}
                        className="rounded-lg object-contain"
                        unoptimized
                      />
                    </td>
                    <td className="p-4">{product.sku_number}</td>
                    <td className="p-4">{product.product_number}</td>
                    <td className="p-4 max-w-md">
                      <div className="line-clamp-2">
                        {product.product_info?.productDescription}
                      </div>
                    </td>
                    <td className="p-4 text-right">{product.quantity}</td>
                    <td className="p-4 text-right">{product.stock_qty}</td>
                    <td className="p-4 text-right">
                      ${product.unit_price?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
