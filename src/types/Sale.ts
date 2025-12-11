export type Currency = "LKR" | "USD" | "EUR" | string;

export interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
}

export interface SaleItem {
    saleItemId: number;
    saleId: number;
    productId: number;
    qty: number;
    price: number;
    discount: number;
}

export interface Sale {
    date: Date;
    saleId: number;
    saleDate: Date | string;
    totalAmount: number;
    totalDiscount: number;  
    paymentMethod: String;
    userId: number;
    customerId: number;
    saleItems: SaleItem[];
    originalTotal: number;
    itemDiscounts: number;
    subtotal: number;
    orderDiscountPercentage: number;
    orderDiscount: number;
    paymentAmount: number;
    balance: number;  
}
export interface SaleItemDTO {
  saleItemId?: number | null;
  saleId?: number | null;
  productId: number;
  qty: number;
  price: number;
  totalPrice: number;
  discount: number;
}

export interface SaleDTO {
  saleId?: number | null;
  saleDate: string |null;
  totalAmount: number;
  totalDiscount: number;
  paymentMethod: string;
  userId: number;
  customerId: number | null;
  saleItems: SaleItemDTO[];
  originalTotal: number;
  itemDiscounts: number;
  subtotal: number;
  orderDiscountPercentage: number;
  orderDiscount: number;
  paymentAmount: number;
  balance: number;
}

