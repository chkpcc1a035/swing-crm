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
