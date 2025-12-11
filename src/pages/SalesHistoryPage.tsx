import React, { useEffect, useState } from 'react';
import { getSaleByUserId } from '../services/SaleService';
import { useAuth } from '../context/AuthContext';
import { getAllSaleItemsBySaleId } from '../services/SaleItemService';

interface Sale {
    saleId: number;
    saleDate: string;
    totalAmount: number;
    totalDiscount: number;
    paymentMethod: string;
    userId: number;
    customerId: number | null;
    // New fields
    originalTotal: number;
    itemDiscounts: number;
    subtotal: number;
    orderDiscountPercentage: number;
    orderDiscount: number;
}

interface SaleResponse {
    statusCode: number;
    message: string;
    saleDTOList: Sale[];
}

// Update SaleItem interface to match new API response
interface SaleItem {
    saleItemId: number;
    saleId: number;
    productName: string;
    barcode: string;
    qty: number;
    price: number;
    totalPrice: number;
    discount: number;
}

const SalesHistoryPage: React.FC = () => {
    const { user } = useAuth(); // Get user from AuthContext
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('all');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalSaleId, setModalSaleId] = useState<number | null>(null);
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [itemsError, setItemsError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.userId) {
            fetchSales(user.userId);
        }
    }, [user]);

    const fetchSales = async (userId: number) => {
        setLoading(true);
        try {
            const response: SaleResponse = await getSaleByUserId(userId);
            setSales(response.saleDTOList || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch sales');
            setSales([]);
        }
        setLoading(false);
    };

    // Method to open modal and fetch sale items
    const handleViewDetails = async (saleId: number) => {
        setModalSaleId(saleId);
        setShowModal(true);
        setItemsLoading(true);
        setItemsError(null);
        try {
            const response = await getAllSaleItemsBySaleId(saleId);
            // Extract saleItemDTOList from response
            const items = Array.isArray(response?.saleItemDTOList) ? response.saleItemDTOList : [];
            setSaleItems(items.reverse());
        } catch (err: any) {
            setItemsError(err.message || 'Failed to fetch sale items');
            setSaleItems([]);
        }
        setItemsLoading(false);
    };

    // Method to close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setModalSaleId(null);
        setSaleItems([]);
        setItemsError(null);
    };

    const filteredSales = sales?.filter(sale => {
        if (!sale) return false;
        
        const matchesSearch = sale.saleId?.toString()?.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || sale.paymentMethod?.toLowerCase() === statusFilter.toLowerCase();

        if (dateRange === 'today') {
            const today = new Date().toISOString().split('T')[0];
            return sale.saleDate?.startsWith(today) && matchesSearch && matchesStatus;
        }
        
        return matchesSearch && matchesStatus;
    }) || [];


    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-8xl mx-auto">
                {/* Header Section */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <h1 className="text-2xl font-bold text-black">Sales History</h1>
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search by customer or sale ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="M21 21l-4.35-4.35"/>
                                </svg>
                            </span>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3 flex-wrap">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            >
                                <option value="all">All Methods</option>
                                <option value="card">Card</option>
                                <option value="cash">Cash</option>
                            </select>

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
                                    onClick={() => setViewMode('cards')}
                                    className={`px-4 py-2 rounded transition-all duration-300 text-sm font-medium ${
                                        viewMode === 'cards'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-black hover:bg-gray-200'
                                    }`}
                                >
                                    Cards
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Loading sales data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                        {viewMode === 'table' ? (
                            // Add a max-h-[500px] (or adjust as needed) and overflow-y-auto to make the table scrollable
                            <div className="overflow-x-auto" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="w-full">
                                    <thead className="bg-blue-50 text-black border-b border-gray-200">
                                        <tr>
                                            <th className="p-4 text-left font-semibold">Sale ID</th>
                                            <th className="p-4 text-left font-semibold">Date</th>
                                            <th className="p-4 text-left font-semibold">Original Total</th>
                                            <th className="p-4 text-left font-semibold">Item Discounts</th>
                                            <th className="p-4 text-left font-semibold">Subtotal</th>
                                            <th className="p-4 text-left font-semibold">Order Discount (%)</th>
                                            <th className="p-4 text-left font-semibold">Order Discount</th>
                                            <th className="p-4 text-left font-semibold">Amount</th>
                                            <th className="p-4 text-left font-semibold">Discount</th>
                                            <th className="p-4 text-left font-semibold">Payment Method</th>
                                            <th className="p-4 text-left font-semibold">User ID</th>
                                            <th className="p-4 text-left font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSales.map((sale, index) => (
                                            <tr key={sale.saleId}
                                                className={`border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                }`}>
                                                <td className="p-4 text-black">#{sale.saleId}</td>
                                                <td className="p-4 text-black">{new Date(sale.saleDate).toLocaleString()}</td>
                                                <td className="p-4 text-black">LKR {sale.originalTotal?.toFixed(2)}</td>
                                                <td className="p-4 text-black">LKR {sale.itemDiscounts?.toFixed(2)}</td>
                                                <td className="p-4 text-black">LKR {sale.subtotal?.toFixed(2)}</td>
                                                <td className="p-4 text-black">{sale.orderDiscountPercentage ?? 0}%</td>
                                                <td className="p-4 text-black">LKR {sale.orderDiscount?.toFixed(2)}</td>
                                                <td className="p-4 text-black">LKR {sale.totalAmount.toFixed(2)}</td>
                                                <td className="p-4 text-black">LKR {sale.totalDiscount.toFixed(2)}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        sale.paymentMethod.toLowerCase() === 'card' 
                                                            ? 'text-blue-700 bg-blue-50 border-blue-100'
                                                            : 'text-green-700 bg-green-50 border-green-100'
                                                    }`}>
                                                        {sale.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-black">{sale.userId}</td>
                                                <td className="p-4">
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800"
                                                        onClick={() => handleViewDetails(sale.saleId)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredSales.map((sale) => (
                                    <div key={sale.saleId} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-black">Sale #{sale.saleId}</h3>
                                                    <p className="text-gray-600">User ID: {sale.userId}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    sale.paymentMethod.toLowerCase() === 'card' 
                                                        ? 'text-blue-700 bg-blue-50 border-blue-100'
                                                        : 'text-green-700 bg-green-50 border-green-100'
                                                }`}>
                                                    {sale.paymentMethod}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Amount:</span>
                                                    <span className="text-black font-medium">LKR {sale.totalAmount.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Discount:</span>
                                                    <span className="text-black font-medium">LKR {sale.totalDiscount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Date:</span>
                                                    <span className="text-black">{new Date(sale.saleDate).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                onClick={() => handleViewDetails(sale.saleId)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {filteredSales.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No sales found matching your criteria</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal for Sale Items */}
                {showModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{
                            background: "rgba(255,255,255,0.7)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)"
                        }}
                        onClick={handleCloseModal}
                    >
                        <div 
                            className="relative bg-white rounded-2xl shadow-2xl w-full border border-blue-100"
                            style={{
                                maxWidth: '1000px',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-3xl font-bold transition-colors z-20 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                                onClick={handleCloseModal}
                                aria-label="Close"
                            >
                                ×
                            </button>
                            
                            {/* Fixed Header */}
                            <div className="p-6 border-b border-gray-200 flex-shrink-0">
                                <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2 pr-12">
                                    <svg className="inline-block" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect x="3" y="7" width="18" height="13" rx="2" fill="#e0f2fe" stroke="#3b82f6"/>
                                        <path d="M16 3v4M8 3v4" stroke="#3b82f6"/>
                                    </svg>
                                    Sale #{modalSaleId} Items
                                </h2>
                            </div>

                            {/* Scrollable Content */}
                            <div 
                                className="flex-1 overflow-auto p-6"
                                style={{ minHeight: 0 }}
                            >
                                {itemsLoading ? (
                                    <div className="flex flex-col items-center py-8">
                                        <svg className="animate-spin h-8 w-8 text-blue-400 mb-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        <span className="text-gray-500 text-lg">Loading items...</span>
                                    </div>
                                ) : itemsError ? (
                                    <div className="text-center py-8 text-red-500 font-semibold">{itemsError}</div>
                                ) : saleItems.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No items found for this sale.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border border-blue-100 rounded-lg shadow-sm bg-blue-50" style={{ minWidth: '800px' }}>
                                            <thead className="sticky top-0 bg-blue-100 z-10">
                                                <tr className="text-blue-900">
                                                    <th className="p-3 text-left font-semibold">#</th>
                                                    <th className="p-3 text-left font-semibold">Product</th>
                                                    <th className="p-3 text-left font-semibold">Barcode</th>
                                                    <th className="p-3 text-left font-semibold">Qty</th>
                                                    <th className="p-3 text-left font-semibold">Price</th>
                                                    <th className="p-3 text-left font-semibold">Total Price</th>
                                                    <th className="p-3 text-left font-semibold">Discount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {saleItems.map((item, idx) => (
                                                    <tr
                                                        key={item.saleItemId}
                                                        className={`border-b hover:bg-blue-100 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-blue-50"}`}
                                                    >
                                                        <td className="p-3">{idx + 1}</td>
                                                        <td className="p-3 font-medium">{item.productName}</td>
                                                        <td className="p-3 text-gray-600 font-mono text-sm">{item.barcode}</td>
                                                        <td className="p-3 font-semibold">{item.qty}</td>
                                                        <td className="p-3 text-blue-700 font-medium">LKR {item.price.toFixed(2)}</td>
                                                        <td className="p-3 text-purple-700 font-medium">LKR {item.totalPrice.toFixed(2)}</td>
                                                        <td className="p-3 text-green-700 font-medium">LKR {item.discount.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesHistoryPage;
