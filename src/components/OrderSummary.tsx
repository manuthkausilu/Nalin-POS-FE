import React, { useState, useEffect } from 'react';
import type { SaleItemDTO } from '../types/Sale';
import type { Product } from '../types/Product';

interface OrderSummaryProps {
  items: SaleItemDTO[];
  products: Product[];
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderTotalsChange?: (totals: {
    originalTotal: number;
    itemDiscounts: number;
    subtotal: number;
    orderDiscountPercentage: number;
    orderDiscount: number;
  }) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onOrderTotalsChange,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);

  // Helper to get product info
  const getProduct = (productId: number) => {
    return products.find(p => Number(p.productId) === productId);
  };

  const originalTotal = items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    const originalPrice = product?.salePrice || 0;
    return sum + originalPrice * item.qty;
  }, 0);

  const discountTotal = items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    const originalPrice = product?.salePrice || 0;
    const discountAmount = originalPrice - (originalPrice - item.discount);
    return sum + discountAmount * item.qty;
  }, 0);

  const subtotal = originalTotal - discountTotal;
  const totalDiscount = Math.min(subtotal, subtotal * (orderDiscount / 100));
  const total = subtotal - totalDiscount;

  const formatLKR = (amount: number) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  const handleRemoveClick = (productId: string) => {
    setItemToRemove(productId);
    setShowConfirmation(true);
  };

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      onRemoveItem(itemToRemove);
    }
    setShowConfirmation(false);
    setItemToRemove(null);
  };

  // Add useEffect to notify parent of changes
  useEffect(() => {
    if (onOrderTotalsChange) {
      onOrderTotalsChange({
        originalTotal,
        itemDiscounts: discountTotal,
        subtotal,
        orderDiscountPercentage: orderDiscount,
        orderDiscount: totalDiscount
      });
    }
  }, [originalTotal, discountTotal, subtotal, orderDiscount, totalDiscount]);

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center text-gray-400">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="text-lg font-medium">Cart is empty</span>
        <p className="text-sm mt-2">Add some products to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col ${showConfirmation ? 'blur-sm' : ''}`}>
        <h2 className="text-xl font-bold mb-4 text-black">Checkout</h2>
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-24rem)]">
          {items.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No items in order</div>
          ) : (
            <div className="space-y-2 pr-2">
              {items.map((item) => {
                const product = getProduct(item.productId);
                return (
                  <div key={item.productId} className="flex items-center gap-4 mb-4 p-2 hover:bg-gray-50 rounded">
                    <div className="flex-1">
                      <h3 className="text-black font-medium">{product?.productName || 'Unknown'}</h3>
                      <p className="text-blue-600">
                        {item.discount > 0 ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">
                              {formatLKR(product?.salePrice || 0)}
                            </span>
                            {formatLKR(item.price)}
                          </>
                        ) : (
                          formatLKR(item.price)
                        )}
                        {item.discount > 0 && (
                          <span className="text-red-500 text-sm ml-2">(-{item.discount})</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.productId.toString(), -1)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-black"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.productId.toString(), 1)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-black"
                      >
                        +
                      </button>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveClick(item.productId.toString())}
                        className="ml-2 text-red-600 hover:text-red-800 px-2 py-1 rounded"
                        aria-label={`Remove ${product?.productName || 'item'}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Original Total</span>
            <span className="font-medium">{formatLKR(originalTotal)}</span>
          </div>
          <div className="flex justify-between mb-2 text-red-600">
            <span>Item Discounts</span>
            <span>-{formatLKR(discountTotal)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatLKR(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Order Discount (%)</span>
            <input
              type="number"
              min="0"
              max={100}
              value={orderDiscount}
              onChange={(e) => setOrderDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
            />
          </div>
          {orderDiscount > 0 && (
            <div className="flex justify-between mb-2 text-red-600">
              <span>Order Discount</span>
              <span>-{formatLKR(totalDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between mb-4">
            <span className="font-bold text-black">Total</span>
            <span className="font-bold text-blue-600">{formatLKR(total)}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="fixed inset-0 bg-white/50 backdrop-blur-sm" 
            onClick={() => setShowConfirmation(false)}
          ></div>
          <div className="bg-white p-6 rounded-lg shadow-xl z-10 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove this item from the order?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderSummary;
