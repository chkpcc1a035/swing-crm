export interface Inventory {
  id: string;
  created_at: string;
  stock_location: string;
  website_status: {
    isStocked: boolean;
    updatedDatabase: boolean;
  };
  sku_number: string;
  product_number: string;
  product_info: {
    productImagePath: string;
    productDescription: string;
  };
  quantity: number;
  wholesale_price: number;
  cost_price: number;
  delivery_fee: number;
  unit_price: number;
  retail_price: number;
  product_series_id: string;
  stock_qty: number;
  series_name: string;
  product_series?: {
    id: string;
    name: string;
    description?: string;
    series_name: string;
  };
  event_location: string;
}

export interface ViewStorageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Inventory | null;
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: Inventory | null;
  isDeleting: boolean;
}

export interface Order {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          order_number: string;
          order_type: "purchase" | "sale" | "transfer" | "return";
          order_status: "pending" | "processing" | "completed" | "cancelled";
          from_location: string | null;
          to_location: string | null;
          reference_number: string | null;
          subtotal: number;
          tax_amount: number;
          shipping_fee: number;
          total_amount: number;
          notes: string | null;
          metadata: Record<string, unknown> | null;
          created_by: string | null;
        };
      };
    };
  };
}

export interface OrderTableProps {
  id: string;
  created_at: string;
  reference_number: string;
  transaction_type: string;
  from_location: string;
  to_location: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  inventory?: {
    id: string;
    sku_number: string;
    product_number: string;
    product_info: Record<string, unknown>;
  };
}

export interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface ProductInfo {
  productDescription: string;
}

export interface InventoryDetails {
  id: string;
  sku_number: string;
  product_number: string;
  unit_price: number;
  retail_price: number;
  stock_location: string;
  quantity: number;
  product_info?: {
    productDescription: string;
  };
}

export interface OrderItem {
  inventory_id: string;
  inventory_details: InventoryDetails | null;
  quantity: string;
  unit_price: string | number;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  count?: number;
}
