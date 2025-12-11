import React, { useState } from 'react';
import type { SaleItemDTO } from '../types/Sale';
import OrderSummary from './OrderSummary';
import type { Product } from '../types/Product';

interface CheckoutSectionProps {
  orderItems: SaleItemDTO[];
  products: Product[];
  paymentMethod: string;
  orderTotals: {
    originalTotal: number;
    itemDiscounts: number;
    subtotal: number;
    orderDiscountPercentage: number;
    orderDiscount: number;
    paymentAmount?: number;
    balance?: number;
  };
  onOrderTotalsChange: (totals: {
    originalTotal: number;
    itemDiscounts: number;
    subtotal: number;
    orderDiscountPercentage: number;
    orderDiscount: number;
    paymentAmount?: number;
    balance?: number;
  }) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  onPaymentMethodChange: (method: string) => void;
  onCheckout: () => void;
  onClear: () => void;
}

const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  orderItems,
  products,
  paymentMethod,
  onUpdateQuantity,
  onRemoveItem,
  onPaymentMethodChange,
  onCheckout,
  onClear,
  onOrderTotalsChange,
  orderTotals
}) => {
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setPaymentAmount(amount);
    const numAmount = parseFloat(amount) || 0;
    const total = orderTotals.subtotal - orderTotals.orderDiscount;
    const change = numAmount - total;
    
    onOrderTotalsChange({
      ...orderTotals,
      paymentAmount: numAmount,
      balance: change >= 0 ? change : 0
    });
  };

  const isCheckoutDisabled = () => {
    if (paymentMethod === 'CASH') {
      const total = orderTotals.subtotal - orderTotals.orderDiscount;
      return orderItems.length === 0 || parseFloat(paymentAmount) < total;
    }
    return orderItems.length === 0;
  };

  return (
    <div className="w-96 h-full flex flex-col">
      {/* Make OrderSummary scrollable and take available space */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <OrderSummary
          items={orderItems}
          products={products}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onOrderTotalsChange={onOrderTotalsChange}
        />
      </div>
      {/* Checkout/payment section always visible at bottom */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 sticky bottom-0 z-10">
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={e => onPaymentMethodChange(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        {paymentMethod === 'CASH' && (
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Payment Amount</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={handlePaymentAmountChange}
              className="w-full border rounded px-2 py-1"
              placeholder="Enter payment amount"
              min={orderTotals.subtotal - orderTotals.orderDiscount}
            />
            <div className="mt-1 text-sm">
              {/* <div className="text-gray-600">
              Total: LKR {(orderTotals.subtotal - orderTotals.orderDiscount).toFixed(2)}
              </div> */}
              {orderTotals.balance !== undefined && orderTotals.balance > 0 && (
              <div className="text-blue-600 text-xl font-bold">
                Balance : LKR {orderTotals.balance.toFixed(2)}
              </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            className="flex-1 py-2 text-red-600 border border-red-100 rounded font-medium hover:bg-red-50 transition-colors"
            onClick={onClear}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            onClick={onCheckout}
            disabled={isCheckoutDisabled()}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSection;