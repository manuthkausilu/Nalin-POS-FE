export interface SaleItemReport {
  productId: number | null;
  productName: string;
  qty: number;
  salePrice: number;
  totalPrice: number;
  discount: number;
  totalAmount: number;
}
