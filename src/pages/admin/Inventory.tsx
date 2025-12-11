import React, { useState, useEffect } from 'react';
import { getProductsWithLowQty, updateProduct, getActiveProducts } from '../../services/ProductService';
import { getAllCategories } from '../../services/CategoryService';

interface Product {
    productId: string;
    barcode: string;
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

interface Category {
    categoryId: number;
    name: string;
}

const Inventory: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories first
        const categoriesResponse = await getAllCategories();
        setCategories(categoriesResponse?.categoryDTOList || []);

        // Try to fetch low stock products, fallback to all products if needed
        try {
          const productsResponse = await getProductsWithLowQty();
          setLowStockProducts(productsResponse?.productDTOList || []);
        } catch (lowStockError) {
          console.warn("Low stock endpoint failed, filtering all products:", lowStockError);
          // Fallback: get all products and filter for low stock
          const allProductsResponse = await getActiveProducts();
          const allProducts = allProductsResponse?.productDTOList || [];
          const lowStockProducts = allProducts.filter((product: Product) => product.qty < 10);
          setLowStockProducts(lowStockProducts);
        }
      } catch (err) {
        console.error("Failed to fetch inventory data:", err);
        setError("Failed to load inventory data. Please check your connection and try again.");
        setLowStockProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryName = (categoryId: number) => {
    if (!categories.length) return 'Loading...';
    const category = categories.find(cat => cat.categoryId === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getStockStatus = (qty: number) => {
    if (qty === 0) {
      return {
        label: 'Out of Stock',
        className: 'bg-red-100 text-red-800'
      };
    } else if (qty < 10) {
      return {
        label: 'Low Stock',
        className: 'bg-yellow-100 text-yellow-800'
      };
    } else {
      return {
        label: 'In Stock',
        className: 'bg-green-100 text-green-800'
      };
    }
  };

  const filteredProducts = lowStockProducts.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRestockClick = (product: Product) => {
    setSelectedProductForRestock(product);
    setRestockQuantity(0);
    setIsRestockModalOpen(true);
  };

  const handleRestock = async () => {
    if (!selectedProductForRestock || restockQuantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setUpdating(true);
    try {
      const updatedProduct = {
        ...selectedProductForRestock,
        qty: selectedProductForRestock.qty + restockQuantity
      };

      await updateProduct(selectedProductForRestock.productId, updatedProduct);
      
      // Update the local state
      setLowStockProducts(products =>
        products.map(product =>
          product.productId === selectedProductForRestock.productId
            ? { ...product, qty: product.qty + restockQuantity }
            : product
        )
      );

      setIsRestockModalOpen(false);
      setSelectedProductForRestock(null);
      setRestockQuantity(0);
    } catch (err) {
      console.error('Failed to restock product:', err);
      setError('Failed to restock product. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const closeRestockModal = () => {
    setIsRestockModalOpen(false);
    setSelectedProductForRestock(null);
    setRestockQuantity(0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Low Stock Inventory</h1>
          <p className="text-gray-600 mt-1">Monitor products with low stock levels</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by product name or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Low Stock Products ({filteredProducts.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-gray-500">Loading inventory data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product.qty);
                  return (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {/* <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.productName)}&background=f3f4f6&color=374151`}
                              alt={product.productName}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.productName)}&background=f3f4f6&color=374151`;
                              }}
                            />
                          </div> */}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.barcode || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getCategoryName(product.categoryId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {product.qty}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        LKR {product.salePrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleRestockClick(product)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-blue-700 transition-colors"
                          >
                            Restock
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No low stock products found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms' : 'All products are well stocked!'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && selectedProductForRestock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Restock Product
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedProductForRestock.productName}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedProductForRestock.qty} units
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity || ''}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quantity to add"
                />
              </div>
              
              {restockQuantity > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-800">
                    New Stock Level: <span className="font-semibold">
                      {selectedProductForRestock.qty + restockQuantity} units
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
              <button
                onClick={closeRestockModal}
                disabled={updating}
                className="flex-1 bg-white text-gray-700 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={updating || restockQuantity <= 0}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:bg-gray-400"
              >
                {updating ? 'Updating...' : 'Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;