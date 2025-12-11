import { useState, useEffect, useRef } from 'react';
import CategoryScroll from '../components/CategoryScroll';
import { getAllCategories, type Category } from '../services/CategoryService';
import { getAllBrands } from '../services/BrandService';
import { 
  getActiveProducts,
  getProductsByCategory,
  getProductsByBrand,
  searchProducts,
  getProductsByCategoryAndBrand,
} from '../services/ProductService';
import AddToCartModal from '../components/AddToCartModal';
import type { Product } from '../types/Product';
import type { Sale, SaleDTO, SaleItemDTO } from '../types/Sale';
import { saveSale } from '../services/SaleService';
import BarcodeScanner from '../components/BarcodeScanner';
import { mapSaleDTOToSale } from '../util/SaleMapper';
import ReceiptModal from '../components/ReceiptModal';
import HeaderSection from '../components/HeaderSection';
import ProductsDisplay from '../components/ProductsDisplay';
import CheckoutSection from '../components/CheckoutSection';

interface Brand {
  brandId: string | number;
  brandName: string;  
}

interface OrderTotals {
  originalTotal: number;
  itemDiscounts: number;
  subtotal: number;
  orderDiscountPercentage: number;
  orderDiscount: number;
  paymentAmount?: number;
  balance?: number;
}

const PosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [orderItems, setOrderItems] = useState<SaleItemDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  // Master product list: always contains merged product details (not impacted by filtered display)
  const [masterProducts, setMasterProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerId, _setCustomerId] = useState<number | null>(null);
  const [userId] = useState<number>(1);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null!);
  const [showReceipt, setShowReceipt] = useState(false);
  const [saleData, setSaleData] = useState<Sale | null>(null);
  const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(false);
  const [orderTotals, setOrderTotals] = useState<OrderTotals>({
    originalTotal: 0,
    itemDiscounts: 0,
    subtotal: 0,
    orderDiscountPercentage: 0,
    orderDiscount: 0
  });

  // Helper: add missing product objects into masterProducts, but never overwrite existing objects
  const addMissingProductsToMaster = (newProducts: Product[]) => {
    setMasterProducts(prev => {
      const existingIds = new Set(prev.map(p => Number(p.productId)));
      const missing = newProducts.filter(p => !existingIds.has(Number(p.productId)));
      if (missing.length === 0) {
        return prev;
      }
      // append missing products while preserving original prev array identity
      return [...prev, ...missing];
    });
  };

  // Helper: update masterProducts in-place (for example after a refresh) but keep object references whenever possible
  const updateMasterProductsFromList = (newProducts: Product[]) => {
    setMasterProducts(prev => {
      // Build quick lookup by id
      const prevById = new Map(prev.map(p => [Number(p.productId), p]));
      // Update existing objects in-place
      newProducts.forEach(p => {
        const id = Number(p.productId);
        const existing = prevById.get(id);
        if (existing) {
          // update existing object fields to preserve reference
          Object.assign(existing, p);
        } else {
          prevById.set(id, p);
        }
      });
      // Return array that preserves previous order, adding new entries at the end
      const result = [...prev];
      newProducts.forEach(p => {
        if (!result.some(r => Number(r.productId) === Number(p.productId))) {
          result.push(p);
        }
      });
      // If no previous items existed, return new list
      if (prev.length === 0) {
        return newProducts;
      }
      return result;
    });
  };

  // Helper: unify products to reuse masterProducts object references when available
  const unifyProductReferences = (list: Product[]) => {
    if (!masterProducts || masterProducts.length === 0) return list;
    const map = new Map(masterProducts.map(p => [Number(p.productId), p]));
    return list.map(p => {
      const existing = map.get(Number(p.productId));
      return existing ?? p;
    });
  };

  // Fetch categories, brands, and initial products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData, productsData] = await Promise.all([
          getAllCategories(),
          getAllBrands(),
          getActiveProducts()
        ]);
        
        setCategories([
          { categoryId: 'all', name: 'All Categories' },
          ...categoriesData.categoryDTOList
        ]);
        
        setBrands([
          { brandId: 'all', brandName: 'All Brands' },
          ...brandsData.brandDTOList
        ]);

        // initial product list for UI
        setProducts(productsData.productDTOList);
        // set master list for stable lookups (names/prices) as well (use in-place update)
        updateMasterProductsFromList(productsData.productDTOList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch products from backend when filters/search change
  // Note: include masterProducts in deps so we unify references whenever the master list changes
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        let productsData: { productDTOList: Product[] } | null = null;

        // All filters are 'all' and search is empty: get all active products
        if (selectedCategory === 'all' && selectedBrand === 'all' && search.trim() === '') {
          productsData = await getActiveProducts();
        }
        // Only search is present
        else if (search.trim() !== '' && selectedCategory === 'all' && selectedBrand === 'all') {
          productsData = await searchProducts(search.trim());
        }
        // Category and brand are selected (not 'all'), no search
        else if (selectedCategory !== 'all' && selectedBrand !== 'all' && search.trim() === '') {
          productsData = await getProductsByCategoryAndBrand(selectedCategory, selectedBrand);
        }
        // Only category is selected
        else if (selectedCategory !== 'all' && selectedBrand === 'all' && search.trim() === '') {
          productsData = await getProductsByCategory(selectedCategory);
        }
        // Only brand is selected
        else if (selectedBrand !== 'all' && selectedCategory === 'all' && search.trim() === '') {
          productsData = await getProductsByBrand(selectedBrand);
        }
        // Category and search
        else if (selectedCategory !== 'all' && search.trim() !== '' && selectedBrand === 'all') {
          const pd = await searchProducts(search.trim());
          productsData = { productDTOList: pd.productDTOList.filter((p: any) => p.categoryId?.toString() === selectedCategory) };
        }
        // Brand and search
        else if (selectedBrand !== 'all' && search.trim() !== '' && selectedCategory === 'all') {
          const pd = await searchProducts(search.trim());
          productsData = { productDTOList: pd.productDTOList.filter((p: any) => p.brandId?.toString() === selectedBrand) };
        }
        // Category, brand, and search
        else if (selectedCategory !== 'all' && selectedBrand !== 'all' && search.trim() !== '') {
          const pd = await searchProducts(search.trim());
          productsData = { productDTOList: pd.productDTOList.filter(
            (p: any) => p.categoryId?.toString() === selectedCategory && p.brandId?.toString() === selectedBrand
          )};
        }

        if (productsData) {
          // Important: DO NOT merge or overwrite masterProducts here.
          // Only update the UI's products state.
          // Also reuse any masterProducts objects to preserve identity (prevent remounts or name swap)
          const unified = unifyProductReferences(productsData.productDTOList);
          setProducts(unified);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching filtered products:', error);
        setProducts([]);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedBrand, search, masterProducts]);

  useEffect(() => {
    if (orderItems.length > 0) {
      setIsCheckoutDisabled(false);
    }
  }, [orderItems.length]);

  const handleUpdateQuantity = (productId: string, change: number) => {
    setOrderItems(items =>
      items
        .map(item =>
          item.productId === Number(productId)
            ? { ...item, qty: Math.max(0, item.qty + change) }
            : item
        )
        .filter(item => item.qty > 0)
    );
  };

  const handleAddToOrder = (product: Product, quantity: number, discount: number) => {
    // Ensure masterProducts contains this product (but don't overwrite any preexisting object)
    addMissingProductsToMaster([product]);

    setOrderItems(items => {
      const existingItem = items.find(item => item.productId === Number(product.productId));
      const price = Math.max(0, product.salePrice - discount); // Apply absolute discount
      const totalPrice = price * quantity;
      if (existingItem) {
        return items.map(item =>
          item.productId === Number(product.productId)
            ? {
                ...item,
                qty: item.qty + quantity,
                discount: discount,
                price: price,
                totalPrice: (item.qty + quantity) * price,
              }
            : item
        );
      }
      return [
        ...items,
        {
          productId: Number(product.productId),
          qty: quantity,
          price: price,
          discount: discount,
          totalPrice: totalPrice,
        },
      ];
    });
    setIsQuantityModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsQuantityModalOpen(true);
  };

  const handleBarcodeScan = async (barcode: string) => {
    // Find based on masterProducts (stable set) first
    const product = masterProducts.find(p => p.barcode === barcode) || products.find(p => p.barcode === barcode);
    if (product) {
      setSelectedProduct(product);
      setIsQuantityModalOpen(true);
    } else {
      alert('Product not found');
    }
  };

  // Helper to calculate totals
  const getTotals = () => {
    let totalAmount = 0;
    let totalDiscount = 0;
    orderItems.forEach(item => {
      const originalPrice = masterProducts.find(p => Number(p.productId) === item.productId)?.salePrice || 0;
      totalAmount += item.price * item.qty;
      totalDiscount += (originalPrice - item.price) * item.qty;
    });
    totalDiscount += orderTotals.orderDiscount;
    totalAmount -= orderTotals.orderDiscount;
    return { totalAmount, totalDiscount };
  };

  // Prepare SaleDTO for sending
  const prepareSaleDTO = (): SaleDTO => {
    const { totalAmount, totalDiscount } = getTotals();
    
    return {
      saleId: null,
      saleDate: null,
      totalAmount,
      totalDiscount,
      paymentMethod,
      userId,
      customerId,
      originalTotal: orderTotals.originalTotal,
      itemDiscounts: orderTotals.itemDiscounts,
      subtotal: orderTotals.subtotal,
      orderDiscountPercentage: orderTotals.orderDiscountPercentage,
      orderDiscount: orderTotals.orderDiscount,
      paymentAmount: orderTotals.paymentAmount ?? 0,
      balance: orderTotals.balance ?? 0,
      saleItems: orderItems.map(item => ({
        saleItemId: null,
        saleId: null,
        productId: item.productId,
        qty: item.qty,
        price: item.price,
        discount: item.discount,
        totalPrice: item.totalPrice, // include totalPrice
      })),
    };
  };

  // Helper function to refresh products
  const refreshProducts = async () => {
    try {
      const productsData = await getActiveProducts();
      setProducts(productsData.productDTOList);
      // Update masterProducts with fresh stock/pricing information but preserve references
      updateMasterProductsFromList(productsData.productDTOList);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  // Updated handleCheckout function with product refresh
  const handleCheckout = async () => {
    if (isCheckoutDisabled) return;
    setIsCheckoutDisabled(true);
    const saleDTO = prepareSaleDTO();
    console.log('Prepared SaleDTO:', saleDTO);
    try {
      const response = await saveSale(saleDTO);
      console.log("Response saleDTO :" , response.saleDTO)
      if (response.statusCode === 201) {
        // Create a complete sale object combining response and prepared data
        const newSaleData: Sale = {
          ...mapSaleDTOToSale(response.saleDTO),
          saleItems: saleDTO.saleItems.map(item => ({
            saleItemId: 0, // We'll use a counter if needed
            saleId: response.saleDTO.saleId || 0,
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            discount: item.discount
          }))
        };
        
        setSaleData(newSaleData);
        setShowReceipt(true);
        setOrderItems([]); // Clear the order items
        await refreshProducts(); // Refresh products after checkout
      } else {
        setIsCheckoutDisabled(false);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setIsCheckoutDisabled(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems(items => items.filter(item => item.productId !== Number(productId)));
  };

  const focusBarcodeInput = () => {
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  // Listen for Escape key to close barcode scanner modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBarcodeModalOpen) {
        setIsBarcodeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBarcodeModalOpen]);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-white flex gap-4 p-4 overflow-hidden">
      {!showReceipt ? (
        <>
          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden">
            <HeaderSection
              viewMode={viewMode}
              setViewMode={setViewMode}
              search={search}
              setSearch={setSearch}
              onBarcodeClick={() => setIsBarcodeModalOpen(true)}
            />

            {/* Categories Scroll */}
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
              <CategoryScroll
                items={categories.map(cat => ({
                  id: cat.categoryId?.toString() || 'all',
                  name: cat.name
                }))}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>

            {/* Brands Scroll */}
            <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
              <CategoryScroll
                items={brands.map(brand => ({
                  id: brand.brandId.toString(),
                  name: brand.brandName
                }))}
                selected={selectedBrand}
                onSelect={setSelectedBrand}
              />
            </div>

            {/* Products Display */}
            <div className="bg-white shadow-lg rounded-2xl p-4 border border-gray-100 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-2">
                <ProductsDisplay
                  viewMode={viewMode}
                  products={products}
                  onProductSelect={handleProductSelect}
                />
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          <div className={`transition-opacity ${isCheckoutDisabled ? 'pointer-events-none opacity-60' : ''}`}>
            <CheckoutSection
              orderItems={orderItems}
              products={masterProducts} // pass stable list so names/prices are always present in cart bill
              paymentMethod={paymentMethod}
              orderTotals={orderTotals}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onPaymentMethodChange={setPaymentMethod}
              onCheckout={handleCheckout}
              onClear={() => setOrderItems([])}
              onOrderTotalsChange={setOrderTotals}
            />
          </div>

          {/* Modals */}
          {isQuantityModalOpen && selectedProduct && (
            <AddToCartModal
              product={selectedProduct}
              onClose={() => {
                setIsQuantityModalOpen(false);
                setSelectedProduct(null);
                setIsBarcodeModalOpen(true);
                focusBarcodeInput();
              }}
              onAdd={(product, quantity, discount) => {
                handleAddToOrder(product, quantity, discount);
                setIsBarcodeModalOpen(true);
                focusBarcodeInput();
              }}
            />
          )}

          <BarcodeScanner
            isOpen={isBarcodeModalOpen}
            onClose={() => setIsBarcodeModalOpen(false)}
            onScan={handleBarcodeScan}
            inputRef={barcodeInputRef}
          />
        </>
      ) : (
        saleData && (
          <ReceiptModal 
            isOpen={showReceipt}
            onClose={() => {
              setShowReceipt(false);
              setSaleData(null);
            }}
            sale={saleData}
          />
        )
      )}
    </div>
  );
};

export default PosPage;