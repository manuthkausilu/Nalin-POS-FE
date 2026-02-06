export interface SaleReport {
  saleId: number | null;
  saleDate: string; // ISO date-time string
  itemCount: number;
  originalTotal: number;
  itemDiscounts: number;
  orderDiscount: number;
  totalDiscount: number;
  totalAmount: number;
}
