import React, { useEffect, useState } from 'react';
import { getAllCategories } from '../services/CategoryService';
import { getAllBrands } from '../services/BrandService';
import {
    getActiveProducts,
    getProductsByCategory,
    getProductsByBrand,
    searchProducts,
    getProductsWithLowQty,
    getProductsByCategoryAndBrand
} from '../services/ProductService';

interface Product {
    productId: string;
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

const InventoryPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const fetchCategories = async () => {
        const response = await getAllCategories();
        setCategories(response.categoryDTOList);
    };

    const fetchBrands = async () => {
        const response = await getAllBrands();
        setBrands(response.brandDTOList);
    };

    const fetchProducts = async () => {
        // If searching, use searchProducts
        if (searchTerm.trim()) {
            const response = await searchProducts(searchTerm.trim());
            setProducts(response.productDTOList);
            return;
        }

        // If both category and brand are selected (not 'All'), use getProductsByCategoryAndBrand
        if (selectedCategory !== 'All' && selectedBrand !== 'All') {
            const categoryObj = categories.find(cat => cat.name === selectedCategory);
            const brandObj = brands.find(br => br.brandName === selectedBrand);
            if (categoryObj && brandObj) {
                const response = await getProductsByCategoryAndBrand(categoryObj.categoryId, brandObj.brandId);
                setProducts(response.productDTOList);
                return;
            }
        }

        // If only category is selected
        if (selectedCategory !== 'All') {
            const categoryObj = categories.find(cat => cat.name === selectedCategory);
            if (categoryObj) {
                const response = await getProductsByCategory(categoryObj.categoryId);
                setProducts(response.productDTOList);
                return;
            }
        }

        // If only brand is selected
        if (selectedBrand !== 'All') {
            const brandObj = brands.find(br => br.brandName === selectedBrand);
            if (brandObj) {
                const response = await getProductsByBrand(brandObj.brandId);
                setProducts(response.productDTOList);
                return;
            }
        }

        // If status is 'Low Stock'
        if (statusFilter === 'Low Stock') {
            const response = await getProductsWithLowQty();
            setProducts(response.productDTOList);
            return;
        }

        // If status is 'Out of Stock'
        if (statusFilter === 'Out of Stock') {
            const response = await getActiveProducts();
            setProducts(response.productDTOList.filter((p: Product) => p.qty === 0));
            return;
        }

        // If status is 'In Stock'
        if (statusFilter === 'In Stock') {
            const response = await getActiveProducts();
            setProducts(response.productDTOList.filter((p: Product) => p.qty > 0));
            return;
        }

        // Default: get all active products
        const response = await getActiveProducts();
        setProducts(response.productDTOList);
    };

    useEffect(() => {
        fetchCategories();
        fetchBrands();
    }, []);

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedCategory, selectedBrand, statusFilter]);

    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : 'Unknown';
    };

    const getBrandName = (brandId: number) => {
        const brand = brands.find(br => br.brandId === brandId);
        return brand ? brand.brandName : 'Unknown';
    };

    const statusOptions = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

    const getStatus = (stock: number): string => {
        if (stock === 0) return 'Out of Stock';
        if (stock < 10) return 'Low Stock';
        return 'In Stock';
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'Out of Stock': return 'text-red-700 bg-red-50 border-red-100';
            case 'Low Stock': return 'text-yellow-700 bg-yellow-50 border-yellow-100';
            case 'In Stock': return 'text-green-700 bg-green-50 border-green-100';
            default: return 'text-gray-700 bg-gray-50 border-gray-100';
        }
    };

    const sortedProducts = [...products].sort((a, b) => {
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
        return sortOrder === 'asc'
            ? (aValue < bValue ? -1 : 1)
            : (aValue > bValue ? -1 : 1);
    });

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-8xl mx-auto">
                {/* Controls Section */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                            </span>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3 flex-wrap">
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
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            >
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
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
                        </div>
                             {/* Fetch All Products Button */}
                    <div className="flex ">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('All');
                                setSelectedBrand('All');
                                setStatusFilter('All');
                                fetchProducts();
                            }}
                            className="px-5 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                        >
                            Fetch All Products
                        </button>
                    </div>
                    </div>
               
                </div>

                {/* Content Section */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-[calc(100vh-20rem)] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10 bg-blue-600 text-white border-b border-blue-700 shadow">
                                <tr>
                                    <th className="p-4 text-left font-semibold">Product</th>
                                    <th className="p-4 text-left font-semibold">Category</th>
                                    <th className="p-4 text-left font-semibold">Brand</th>
                                    <th className="p-4 text-left font-semibold">Price</th>
                                    <th className="p-4 text-left font-semibold">Stock</th>
                                    <th className="p-4 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProducts.map((product, index) => (
                                    <tr
                                        key={product.productId}
                                        className={`border-b border-gray-100 transition-all duration-200 group ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        } hover:bg-blue-50`}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-black group-hover:text-blue-700 transition-colors duration-200">{product.productName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                                                {getCategoryName(product.categoryId)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                                                {getBrandName(product.brandId)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-black font-semibold">LKR {product.salePrice}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-semibold ${product.qty === 0 ? 'text-red-600' : product.qty < 10 ? 'text-yellow-700' : 'text-green-700'}`}>
                                                {product.qty}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(getStatus(product.qty))}`}>
                                                {getStatus(product.qty)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedProducts.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No products found matching your criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;