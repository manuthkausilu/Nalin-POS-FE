import React from 'react';

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

interface AdminProductProps {
    product: Product;
    getCategoryName: (categoryId: number) => string;
    getBrandName: (brandId: number) => string;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onGenerateBarcode: (product: Product) => void;
    onToggleActive: (product: Product) => void;
    isSelected?: boolean;
    viewMode: 'table' | 'grid';
}

const AdminProduct: React.FC<AdminProductProps> = ({
    product,
    getCategoryName,
    getBrandName,
    onEdit,
    onGenerateBarcode,
    onToggleActive,
    isSelected,
    viewMode
}) => {
    const handleDeactivateClick = () => {
        if (confirm('Are you sure you want to deactivate this product?')) {
            onToggleActive(product);
        }
    };

    if (viewMode === 'table') {
        return (
            <tr className={`border-b border-gray-100 transition-all duration-200 hover:bg-gray-50/50
                ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50/80' : ''}`}>
                <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 text-sm font-medium">{product.productName.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate" title={product.productName}>{product.productName}</p>
                            <p className="text-gray-500 text-xs truncate">{product.barcode || 'No barcode'}</p>
                        </div>
                    </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center w-fit">
                                 
                                Cate = {getCategoryName(product.categoryId)}
                            
                        </span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center w-fit">
                           Brand = {getBrandName(product.brandId)}
                        </span>
                    </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Cost</span>
                        <span className="font-medium text-gray-900">LKR {product.cost}</span>
                    </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Price</span>
                        <span className="font-medium text-blue-600">LKR {product.salePrice}</span>
                    </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-baseline gap-1">
                            <span className="font-medium text-gray-900">{product.qty}</span>
                            <span className="text-xs text-gray-500">units</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.qty > 10 
                            ? 'bg-green-50 text-green-700' 
                            : product.qty > 0 
                            ? 'bg-yellow-50 text-yellow-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                            {product.qty > 10 ? 'In Stock' : product.qty > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                    </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="p-3">
                    <div className="grid grid-cols-2 gap-1.5 w-[160px]">
                        <button
                            onClick={() => onEdit(product)}
                            title="Edit Product"
                            className="flex items-center justify-center gap-1 text-blue-600 px-2 py-1 text-xs font-medium border border-blue-100 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={handleDeactivateClick}
                            title="Deactivate Product"
                            className="flex items-center justify-center gap-1 text-red-600 px-2 py-1 text-xs font-medium border border-red-100 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Delete
                        </button>
                        <button
                            onClick={() => onGenerateBarcode(product)}
                            title="Generate Barcode"
                            className="flex items-center justify-center gap-1 text-gray-600 px-2 py-1 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Barcode
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate" title={product.productName}>
                        {product.productName}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                            {getCategoryName(product.categoryId)}
                        </span>
                        <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-xs">
                            {getBrandName(product.brandId)}
                        </span>
                    </div>
                </div>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    product.isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-medium text-blue-600">LKR {product.salePrice}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Cost</p>
                    <p className="font-medium text-gray-700">LKR {product.cost}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Stock</p>
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900">{product.qty}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                            product.qty > 10 
                            ? 'bg-green-50 text-green-700' 
                            : product.qty > 0 
                            ? 'bg-yellow-50 text-yellow-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                            {product.qty > 10 ? 'In Stock' : product.qty > 0 ? 'Low' : 'Out'}
                        </span>
                    </div>
                </div>
            </div>

            {product.barcode && (
                <div className="mb-3">
                    <p className="text-xs text-gray-500">Barcode: <span className="font-mono text-gray-900">{product.barcode}</span></p>
                </div>
            )}
            
            <div className="flex gap-1.5 mt-2">
                <button
                    onClick={() => onEdit(product)}
                    className="flex-1 inline-flex items-center justify-center text-blue-600 px-2 py-1 text-xs font-medium border border-blue-100 rounded hover:bg-blue-50"
                >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                </button>
                <button
                    onClick={handleDeactivateClick}
                    className="flex-1 inline-flex items-center justify-center text-red-600 px-2 py-1 text-xs font-medium border border-red-100 rounded hover:bg-red-50"
                >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Delete
                </button>
            </div>
            <button
                onClick={() => onGenerateBarcode(product)}
                className="mt-1.5 w-full inline-flex items-center justify-center text-gray-600 px-2 py-1 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50"
            >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Generate Barcode
            </button>
        </div>
    );
};

export default AdminProduct;