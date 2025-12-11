export interface Product {
  productId: string;
  barcode: string;  // Added barcode field
  productName: string;
  categoryId: number;
  brandId: number;
  cost: number;
  salePrice: number;
  qty: number;
  isActive: boolean;
  trackInventory: boolean;
  image?: string;
}
