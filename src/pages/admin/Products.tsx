import React, { useEffect, useRef, useState } from 'react';
import { getAllCategories } from '../../services/CategoryService';
import { getAllBrands } from '../../services/BrandService';
import {
    deleteProduct,
    getAllProducts,
    saveProduct,
    updateProduct,
    getProductsByCategory,
    getProductsByBrand,
    searchProducts,
    // getActiveProducts,
    getProductsWithLowQty,
    getProductsByCategoryAndBrand
} from '../../services/ProductService';
import Barcode from 'react-barcode';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import AdminProduct from '../../components/admin/AdminProduct';

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

interface Brand {
    brandId: number;
    brandName: string;
}

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'sales'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);
    const barcodeRef = useRef<HTMLDivElement>(null);

    const [newProduct, setNewProduct] = useState<Product>({
        productId: '',
        barcode: '',
        productName: '',
        categoryId: 0,
        brandId: 0,
        cost: 0,
        salePrice: 0,
        qty: 0,
        isActive: false,
        trackInventory: false,
        image: '',
    });

    const fetchCategories = async () => {
        // Fetch categories from API
        const response = await getAllCategories();
        setCategories(response.categoryDTOList);
    };

    const fetchBrands = async () => {
        // Fetch brands from API
        const response = await getAllBrands();
        setBrands(response.brandDTOList);
    };

    const fetchProducts = async () => {
        // Fetch products from API
        const response = await getAllProducts();
        setProducts(response.productDTOList);
    };

    // Fetch products based on filters
    const fetchFilteredProducts = async () => {
        try {
            // If searching, use search endpoint
            if (searchTerm.trim() !== '') {
                const response = await searchProducts(searchTerm);
                setProducts(response.productDTOList || []);
                return;
            }

            // If both category and brand are selected (not 'All'), use by-category-brand endpoint
            if (selectedCategory !== 'All' && selectedBrand !== 'All') {
                const categoryObj = categories.find(cat => cat.name === selectedCategory);
                const brandObj = brands.find(br => br.brandName === selectedBrand);
                if (categoryObj && brandObj) {
                    const response = await getProductsByCategoryAndBrand(categoryObj.categoryId, brandObj.brandId);
                    setProducts(response.productDTOList || []);
                    return;
                }
            }

            // If only category is selected
            if (selectedCategory !== 'All') {
                const categoryObj = categories.find(cat => cat.name === selectedCategory);
                if (categoryObj) {
                    const response = await getProductsByCategory(categoryObj.categoryId);
                    setProducts(response.productDTOList || []);
                    return;
                }
            }

            // If only brand is selected
            if (selectedBrand !== 'All') {
                const brandObj = brands.find(br => br.brandName === selectedBrand);
                if (brandObj) {
                    const response = await getProductsByBrand(brandObj.brandId);
                    setProducts(response.productDTOList || []);
                    return;
                }
            }

            // If status filter is set
            if (statusFilter === 'Low Stock') {
                const response = await getProductsWithLowQty();
                setProducts(response.productDTOList || []);
                return;
            }
            if (statusFilter === 'Out of Stock') {
                // No direct endpoint, so get all and filter out of stock
                const response = await getAllProducts();
                setProducts((response.productDTOList || []).filter((p: any) => p.qty === 0));
                return;
            }
            if (statusFilter === 'In Stock') {
                // No direct endpoint, so get all and filter in stock
                const response = await getAllProducts();
                setProducts((response.productDTOList || []).filter((p: any) => p.qty > 0));
                return;
            }

            // If statusFilter is 'All', get all or active products
            if (statusFilter === 'All') {
                const response = await getAllProducts();
                setProducts(response.productDTOList || []);
                return;
            }
        } catch (error) {
            setProducts([]);
        }
    };

    // Fetch categories and brands on mount
    useEffect(() => {
        fetchCategories();
        fetchBrands();
    }, []);

    // Only fetch products when filters/search change, but not on mount (products is empty by default)
    useEffect(() => {
        // Only fetch if a filter/search is applied
        if (
            searchTerm.trim() !== '' ||
            selectedCategory !== 'All' ||
            selectedBrand !== 'All' ||
            statusFilter !== 'All'
        ) {
            fetchFilteredProducts();
        }
        // eslint-disable-next-line
    }, [searchTerm, selectedCategory, selectedBrand, statusFilter, categories, brands]);

    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : 'Unknown';
    };

    const getBrandName = (brandId: number) => {
        const brand = brands.find(br => br.brandId === brandId);
        return brand ? brand.brandName : 'Unknown';
    };

    // const statusOptions = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

    // const getStatus = (stock: number): string => {
    //     if (stock === 0) return 'Out of Stock';
    //     if (stock < 10) return 'Low Stock';
    //     return 'In Stock';
    // };

    // Sort the products array
    const filteredAndSortedProducts = [...products].sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
            case 'name':
                aValue = a.productName.toLowerCase();
                bValue = b.productName.toLowerCase();
                break;
            case 'price':
                aValue = a.salePrice;
                bValue = b.salePrice;
                break;
            case 'stock':
                aValue = a.qty;
                bValue = b.qty;
                break;
            default:
                return 0;
        }
        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    const handleAddProduct = async () => {
        if (!newProduct.productName || !newProduct.categoryId || newProduct.salePrice <= 0 || newProduct.cost <= 0 || newProduct.qty <= 0) {
            alert("Name, Category, Cost, Sale Price, and Stock Quantity are required!");
            return;
        }

        newProduct.productId = Date.now().toString();

        if (editingProduct) {
            setProducts(products.map(product =>
                product.productId === editingProduct.productId ? { ...newProduct, productId: editingProduct.productId } : product
            ));

            await updateProduct(editingProduct.productId, newProduct);
            fetchProducts();
        } else {
            await saveProduct(newProduct);
            fetchProducts();
        }

        resetModal();
    };

    // Add a state to track the selected/edited product for row highlight
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const handleEditProduct = (product: Product) => {
        setNewProduct(product);
        setEditingProduct(product);
        setIsModalOpen(true);
        setSelectedProductId(product.productId); // highlight row
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(product => product.productId !== id));
            await deleteProduct(id);
        }
    };

    const resetModal = () => {
        setNewProduct({
            productId: '',
            barcode: '',
            productName: '',
            categoryId: 0,
            brandId: 0,
            cost: 0,
            salePrice: 0,
            qty: 0,
            isActive: false,
            trackInventory: false,
        });
        setEditingProduct(null);
        setIsModalOpen(false);   
        setSelectedProductId(null); // remove highlight
    };

    // const handleImageUpload = (file: File) => {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //         setNewProduct({ ...newProduct, image: reader.result as string });
    //     };
    //     reader.readAsDataURL(file);
    // };

    const handleGenerateBarcodeClick = (product: Product) => {
        setSelectedProductForBarcode(product);
        setIsBarcodeModalOpen(true);
    };

    const handleSaveBarcode = () => {
        if (barcodeRef.current === null || !selectedProductForBarcode) {
            return;
        }

        toPng(barcodeRef.current, { cacheBust: true })
            .then((dataUrl) => {
                saveAs(dataUrl, `${selectedProductForBarcode.barcode || 'barcode'}.png`);
            })
            .catch((err) => {
                console.error('Failed to generate barcode image', err);
            });
    };

    const isFormValid = 
        newProduct.productName.trim() !== '' &&
        newProduct.categoryId &&
        newProduct.cost > 0 &&
        newProduct.salePrice > 0 &&
        newProduct.qty > 0;


    // const handlePrintBarcode = () => {
    //     if (barcodeRef.current === null) {
    //         return;
    //     }
    //     const printWindow = window.open('', '', 'height=400,width=800');
    //     if (printWindow) {
    //         printWindow.document.write('<html><head><title>Print Barcode</title>');
    //         printWindow.document.write('<style>body { display: flex; align-items: center; justify-content: center; height: 100%; margin: 0; }</style>');
    //         printWindow.document.write('</head><body>');
    //         printWindow.document.write(barcodeRef.current.innerHTML);
    //         printWindow.document.write('</body></html>');
    //         printWindow.document.close();
    //         printWindow.focus();
    //         printWindow.print();
    //         printWindow.close();
    //     }
    // };

    const handleToggleActive = async (product: Product) => {
        const updatedProduct = { ...product, isActive: !product.isActive };
        await updateProduct(product.productId, updatedProduct);
        fetchProducts();
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-8xl mx-auto">
                {/* Controls Section */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
                    <div className="flex flex-col gap-4">
                        {/* Search on top */}
                        <div className="w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            />
                        </div>
                        {/* Filters below search */}
                        <div className="flex gap-3 flex-wrap items-center">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.categoryId} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            >
                                <option value="All">All Brands</option>
                                {brands.map(brand => (
                                    <option key={brand.brandId} value={brand.brandName}>{brand.brandName}</option>
                                ))}
                            </select>
                            {/* <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            >
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select> */}
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field as any);
                                    setSortOrder(order as any);
                                }}
                                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            >
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                                <option value="price-asc">Price Low-High</option>
                                <option value="price-desc">Price High-Low</option>
                                <option value="stock-desc">Stock High-Low</option>
                            </select>
                            {/* View Toggle */}
                            <div className="bg-gray-100 rounded p-1 flex border border-gray-200">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-4 py-2 rounded transition-all duration-300 text-sm font-medium ${
                                        viewMode === 'table'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-black hover:bg-gray-200'
                                    }`}
                                >
                                    Table
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-4 py-2 rounded transition-all duration-300 text-sm font-medium ${
                                        viewMode === 'grid'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-black hover:bg-gray-200'
                                    }`}
                                >
                                    Cards
                                </button>
                            </div>
                            {/* Fetch All Products Button */}
                            <button
                                onClick={async () => {
                                    const response = await getAllProducts();
                                    setProducts(response.productDTOList || []);
                                    setSearchTerm('');
                                    setSelectedCategory('All');
                                    setSelectedBrand('All');
                                    setStatusFilter('All');
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium ml-4"
                            >
                                View All Products
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    {viewMode === 'table' ? (
                        /* Table View */
                        <div className="w-full">
                            <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
                                <table className="w-full table-auto">
                                    <thead className="bg-blue-50 text-black border-b border-gray-200">
                                    <tr>
                                        <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[220px]">Product</th>
                                        <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[140px]">Category & Brand</th>
                                        <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[100px]">Cost</th>
                                        <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[100px]">Sale Price</th>
                                        <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[120px]">Stock</th>
                                        <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[100px]">Status</th>
                                        <th className="p-3 text-left font-semibold whitespace-nowrap min-w-[180px]">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredAndSortedProducts.map((product) => (
                                        <AdminProduct
                                            key={product.productId}
                                            product={product}
                                            getCategoryName={getCategoryName}
                                            getBrandName={getBrandName}
                                            onEdit={handleEditProduct}
                                            onDelete={handleDeleteProduct}
                                            onGenerateBarcode={handleGenerateBarcodeClick}
                                            onToggleActive={handleToggleActive}
                                            isSelected={selectedProductId === product.productId}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredAndSortedProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">No products found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Grid View */
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedProducts.map((product) => (
                                    <AdminProduct
                                        key={product.productId}
                                        product={product}
                                        getCategoryName={getCategoryName}
                                        getBrandName={getBrandName}
                                        onEdit={handleEditProduct}
                                        onDelete={handleDeleteProduct}
                                        onGenerateBarcode={handleGenerateBarcodeClick}
                                        onToggleActive={handleToggleActive}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </div>
                            {filteredAndSortedProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">No products found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Add Product Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 bg-blue-600 text-white border border-blue-600 shadow-lg px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-all duration-200 z-50"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
                Add Product
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 cursor-default">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-black">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {editingProduct ? 'Update product information' : 'Fill in the product details'}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Image Upload */}
                            {/* <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-3 rounded overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                                    {newProduct.image ? (
                                        <img
                                            src={newProduct.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-2xl">No Image</span>
                                    )}
                                </div>
                                <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded text-sm font-medium hover:bg-blue-50 transition-all duration-200">
                                    Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(file);
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div> */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter product name"
                                        value={newProduct.productName}
                                        onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Category *</label>
                                    <select
                                        value={newProduct.categoryId}
                                        onChange={(e) => setNewProduct({ ...newProduct, categoryId: Number(e.target.value) })}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Brand *</label>
                                <select
                                    value={newProduct.brandId}
                                    onChange={(e) => setNewProduct({ ...newProduct, brandId: Number(e.target.value) })}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map((brand) => (
                                        <option key={brand.brandId} value={brand.brandId}>
                                            {brand.brandName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Cost *</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">LKR</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Enter cost"
                                            value={newProduct.cost || ''}
                                            onChange={(e) => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) || 0 })}
                                            className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Sales Price *</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">LKR</span>
                                        <input
                                            type="number"
                                            value={newProduct.salePrice || ""}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, salePrice: parseFloat(e.target.value) || 0 })
                                            }
                                            placeholder="Enter sales price"
                                            className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Stock Quantity *</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={newProduct.qty || ''}
                                    onChange={(e) => setNewProduct({ ...newProduct, qty: parseInt(e.target.value) || 0 })}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                />
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={newProduct.isActive}
                                    onChange={e => setNewProduct({ ...newProduct, isActive: e.target.checked })}
                                    className="mr-2"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-black">
                                    Active
                                </label>
                            </div> */}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
                            <button
                                onClick={resetModal}
                                className="flex-1 bg-white text-black border border-gray-300 py-2 rounded hover:bg-gray-100 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddProduct}
                                disabled={!isFormValid}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium disabled:bg-blue-300"
                            >
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Barcode Modal */}
            {isBarcodeModalOpen && selectedProductForBarcode && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-200">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-black">
                                Barcode for {selectedProductForBarcode.productName}
                            </h2>
                        </div>
                        <div className="p-6 flex flex-col items-center justify-center">
                            {selectedProductForBarcode.barcode ? (
                                <div ref={barcodeRef} className="bg-white p-8 inline-block text-center">
                                     {/* Shop Name */}
                                    <div className="text-black font-bold text-2xl mb-1">
                                        N .I テンポ japan shop
                                    </div>
                                    <Barcode
                                        value={selectedProductForBarcode.barcode}
                                        format="CODE128"
                                        width={3}         // decreased line width (try 0.6 - 1.2 to tune)
                                        height={80}
                                        margin={2}
                                        displayValue={true}
                                        fontSize={40}
                                   />
                                    <div className="text-black font-bold text-4xl mt-1">
                                        LKR {selectedProductForBarcode.salePrice.toFixed(2)}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No barcode available for this product.</p>
                            )}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
                            <button
                                onClick={() => setIsBarcodeModalOpen(false)}
                                className="flex-1 bg-white text-black border border-gray-300 py-2 rounded hover:bg-gray-100 font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSaveBarcode}
                                disabled={!selectedProductForBarcode.barcode}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium disabled:bg-gray-400"
                            >
                                Save
                            </button>
                            {/* <button
                                onClick={handlePrintBarcode}
                                disabled={!selectedProductForBarcode.barcode}
                                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium disabled:bg-gray-400"
                            >
                                Print
                            </button> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;