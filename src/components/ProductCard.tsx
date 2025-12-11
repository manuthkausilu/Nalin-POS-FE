import React from 'react';

interface ProductCardProps {
  name: string;
  price: number;
  stock: number;
  onAdd: () => void;
  view: 'grid' | 'list';
  isActive?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onGenerateBarcode?: () => void;
  onToggleActive?: () => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  name, 
  price, 
  stock, 
  onAdd, 
  view, 
  isActive = true,
  onEdit,
  onDelete,
  onGenerateBarcode,
  onToggleActive
}) => {
  const getStockStatus = (stock: number): { color: string; text: string } => {
    if (stock === 0) return { color: 'bg-red-50 text-red-700 border-red-200', text: 'Out of Stock' };
    if (stock < 10) return { color: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Low Stock' };
    return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'In Stock' };
  };

  const stockStatus = getStockStatus(stock);

  // Update button click handler
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock > 0) {
      onAdd();
    }
  };

  // --- List View ---
  if (view === 'list') {
    return (
      <div
        className="flex items-center gap-4 md:gap-8 p-4 md:p-5 bg-white border border-gray-200 rounded-lg md:rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-disabled={stock === 0}
        aria-label={`Add ${name} to order`}
      >
        <div className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-slate-200 rounded-lg md:rounded-xl overflow-hidden text-slate-600 text-xl md:text-2xl font-semibold">
          <span className="truncate">{getInitials(name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2 truncate" title={name}>{name}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-base md:text-lg font-bold text-blue-600">LKR {price.toFixed(2)}</span>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
              {stock} in stock
            </span>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); handleClick(e); }}
          disabled={stock === 0}
          className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-sm transition-all duration-200 flex-shrink-0 ${
            stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 active:transform active:scale-95'
          }`}
          aria-label={stock === 0 ? 'Out of stock' : `Add ${name} to order`}
        >
          {stock === 0 ? 'Out of Stock' : 'Add to Order'}
        </button>
      </div>
    );
  }

  // --- Grid View ---
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg md:rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-disabled={stock === 0}
      aria-label={`Add ${name} to order`}
    >
      <div className="relative w-full aspect-square p-6 md:p-8 bg-slate-200 flex items-center justify-center">
        <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center text-slate-600 text-3xl md:text-4xl font-semibold rounded-lg md:rounded-xl overflow-hidden">
          <span className="truncate">{getInitials(name)}</span>
        </div>
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col gap-2 md:gap-3">
          <span className="bg-white shadow-sm text-blue-600 px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-bold">
            LKR {price.toFixed(2)}
          </span>
          <span className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-medium border ${stockStatus.color}`}>
            {stock} in stock
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4 md:p-6">
        <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-4 md:mb-6 line-clamp-2 min-h-[3rem] md:min-h-[4rem]" title={name}>
          {name}
        </h3>
        <div className="mt-auto">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={e => { e.stopPropagation(); handleClick(e); }}
                disabled={stock === 0}
                className={`flex-1 py-3 md:py-3.5 rounded-lg md:rounded-xl font-semibold text-sm md:text-base transition-all duration-200 ${
                  stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 active:transform active:scale-95'
                }`}
                aria-label={stock === 0 ? 'Out of stock' : `Add ${name} to order`}
              >
                {stock === 0 ? 'Out of Stock' : 'Add to Order'}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={e => { e.stopPropagation(); onEdit?.(); }}
                className="flex-1 py-2 md:py-2.5 rounded text-sm md:text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                aria-label={`Edit ${name}`}
              >
                Edit
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete?.(); }}
                className="flex-1 py-2 md:py-2.5 rounded text-sm md:text-base font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200"
                aria-label={`Delete ${name}`}
              >
                Delete
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={e => { e.stopPropagation(); onGenerateBarcode?.(); }}
                className="flex-1 py-2 md:py-2.5 rounded text-sm md:text-base font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-all duration-200"
                aria-label={`Generate barcode for ${name}`}
              >
                Barcode
              </button>
              <button
                onClick={e => { e.stopPropagation(); onToggleActive?.(); }}
                className={`flex-1 py-2 md:py-2.5 rounded text-sm md:text-base font-medium transition-all duration-200 ${
                  isActive ? 'text-white bg-red-600 hover:bg-red-700' : 'text-white bg-blue-600 hover:bg-blue-700'
                }`}
                aria-label={isActive ? `Deactivate ${name}` : `Activate ${name}`}
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
