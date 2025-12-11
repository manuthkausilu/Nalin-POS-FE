import React from 'react';
import type { Product } from '../types/Product';

interface ProductsDisplayProps {
  viewMode: 'grid' | 'list';
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const ProductsDisplay: React.FC<ProductsDisplayProps> = ({
  viewMode,
  products,
  onProductSelect,
}) => {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-lg font-medium">No products found</span>
        <p className="text-sm mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-7">
        {products.map((product) => (
          <div
            key={product.productId}
            className={`flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md p-5 hover:shadow-xl hover:border-blue-400 transition-all duration-200 cursor-pointer group relative overflow-hidden`}
            onClick={() => onProductSelect(product)}
            tabIndex={0}
          >
            {/* Decorative accent bar */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-blue-200 opacity-30 rounded-l-2xl group-hover:opacity-60 transition-all duration-200" />
            {/* Low stock badge in top-right */}
            {product.qty > 0 && product.qty < 10 && (
              <span className="absolute top-3 right-4 z-20 px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shadow animate-pulse">
                Low stock
              </span>
            )}
            <div className="flex-1 flex flex-col justify-between z-10">
              <span className="font-bold text-xl text-gray-900 mb-1 truncate">{product.productName}</span>
              <span className="text-xs text-gray-400 mb-3">ID: {product.barcode}</span>
              <span className="text-blue-700 font-extrabold text-lg mb-2 tracking-wide drop-shadow-sm">
                LKR {product.salePrice.toFixed(2)}
              </span>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm
                  ${product.qty === 0
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : product.qty < 10
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                  {product.qty} in stock
                </span>
                {/* Removed inline Low stock tag here */}
              </div>
            </div>
            <button
              className={`w-full py-2.5 rounded-xl font-bold text-base mt-2 transition-all duration-200 shadow-sm
                ${product.qty === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-lg active:scale-95 border border-blue-600'
                }`}
              disabled={product.qty === 0}
              tabIndex={-1}
            >
              {product.qty === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            {/* Subtle background pattern */}
            <div className="absolute right-2 bottom-2 opacity-10 text-blue-300 text-6xl pointer-events-none select-none z-0">
              &#8226;&#8226;&#8226;
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view
  return (
    <ul className="w-full flex flex-col gap-4">
      {products.map((product) => (
        <li
          key={product.productId}
          className="flex items-center justify-between px-7 py-5 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer group"
          onClick={() => onProductSelect(product)}
          tabIndex={0}
        >
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bold text-lg text-gray-900 truncate">{product.productName}</span>
            <span className="text-xs text-gray-400">ID: {product.barcode}</span>
          </div>
          <span className="text-blue-700 font-extrabold text-base mx-6 tracking-wide">LKR {product.salePrice.toFixed(2)}</span>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold mx-2 shadow-sm
            ${product.qty === 0
              ? 'bg-red-100 text-red-700 border border-red-200'
              : product.qty < 10
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
            {product.qty} in stock
          </span>
          {product.qty > 0 && product.qty < 10 && (
            <span className="ml-1 px-2 py-0.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold animate-pulse">
              Low stock
            </span>
          )}
          <button
            className={`ml-6 px-6 py-2 rounded-xl font-bold text-base transition-all duration-200 shadow-sm
              ${product.qty === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 active:scale-95 border border-blue-600'
              }`}
            disabled={product.qty === 0}
            tabIndex={-1}
          >
            {product.qty === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ProductsDisplay;