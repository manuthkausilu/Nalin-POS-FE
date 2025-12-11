import React, { useEffect, useState } from 'react';
import {
  getAllSales,
  getSalesToday,
  getSalesLastWeek,
  getSalesLastMonth,
  getSalesCustomRange,
  deleteSale
} from '../../services/SaleService';
import { getAllSaleItemsBySaleId } from '../../services/SaleItemService';
import ReceiptModal from '../../components/ReceiptModel2';

interface Sale {
  saleId: number;
  saleDate: string;
  totalAmount: number;
  totalDiscount: number;
  paymentMethod: string;
  userId: number;
  customerId: number | null;
  saleItems: null;
  paymentAmount?: number; // added optional
  balance?: number;       // added optional
}

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

const AdminSalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [_loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalSaleId, setModalSaleId] = useState<number | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [rangeType, setRangeType] = useState<'all' | 'today' | 'lastweek' | 'lastmonth' | 'custom'>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  // We'll use modalSaleId (already present) to fetch sale in ReceiptModal2

  useEffect(() => {
    fetchSalesData();
    // eslint-disable-next-line
  }, [rangeType, customStart, customEnd]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      let response;
      switch (rangeType) {
        case 'today':
          response = await getSalesToday();
          break;
        case 'lastweek':
          response = await getSalesLastWeek();
          break;
        case 'lastmonth':
          response = await getSalesLastMonth();
          break;
        case 'custom':
          if (customStart && customEnd) {
            response = await getSalesCustomRange(customStart, customEnd);
          } else {
            setSales([]);
            setLoading(false);
            return;
          }
          break;
        default:
          response = await getAllSales();
      }
      setSales(response.saleDTOList || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSales([]);
    }
    setLoading(false);
  };

  const handleDeleteClick = (saleId: number) => {
    setSaleToDelete(saleId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (saleToDelete) {
      try {
        await deleteSale(saleToDelete);
        setSales(sales.filter(sale => sale.saleId !== saleToDelete));
        setShowDeleteConfirm(false);
        setSaleToDelete(null);
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  // Updated: handler for Print now prepares data and opens ReceiptModal
  const handlePrintClick = async (saleId: number) => {
    // Instead of building a preparedSale on the page, we pass the saleId to ReceiptModal and let it fetch directly.
    setModalSaleId(saleId);
    setShowReceiptModal(true);
  };

  // Method to open modal and fetch sale items
  const handleViewDetails = async (saleId: number) => {
    setModalSaleId(saleId);
    setShowModal(true);
    setItemsLoading(true);
    setItemsError(null);
    try {
      const response = await getAllSaleItemsBySaleId(saleId);
      const items = Array.isArray(response?.saleItemDTOList) ? response.saleItemDTOList : [];
      setSaleItems(items.reverse());
    } catch (err: any) {
      setItemsError(err.message || 'Failed to fetch sale items');
      setSaleItems([]);
    }
    setItemsLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalSaleId(null);
    setSaleItems([]);
    setItemsError(null);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Sales Management</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            className={`px-3 py-2 rounded ${rangeType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setRangeType('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-2 rounded ${rangeType === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setRangeType('today')}
          >
            Today
          </button>
          <button
            className={`px-3 py-2 rounded ${rangeType === 'lastweek' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setRangeType('lastweek')}
          >
            Last Week
          </button>
          <button
            className={`px-3 py-2 rounded ${rangeType === 'lastmonth' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setRangeType('lastmonth')}
          >
            Last Month
          </button>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-2 rounded ${rangeType === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setRangeType('custom')}
            >
              Custom Range
            </button>
            {rangeType === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  className="border rounded px-2 py-1"
                  max={customEnd || undefined}
                />
                <span className="mx-1">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="border rounded px-2 py-1"
                  min={customStart || undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount (LKR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (LKR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Amount (LKR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance (LKR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map(sale => (
              <tr key={sale.saleId}>
                <td className="px-6 py-4 whitespace-nowrap">#{sale.saleId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.saleDate).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{sale.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{sale.totalDiscount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(sale.paymentAmount ?? 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(sale.balance ?? 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{sale.paymentMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap">#{sale.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(sale.saleId)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    View
                  </button>

                  {/* Added Print button for testing (logs to console) */}
                  <button
                    onClick={() => handlePrintClick(sale.saleId)}
                    className="text-green-600 hover:text-green-800 mr-4"
                  >
                    Print
                  </button>

                  <button
                    onClick={() => handleDeleteClick(sale.saleId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-black">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this sale? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Items Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          }}
        >
          {/* Modal: constrained to viewport height and prevents overflow */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-blue-100 animate-fade-in flex flex-col"
            style={{ maxHeight: '80vh', overflow: 'hidden' }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-3xl font-bold transition-colors"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Sale #{modalSaleId} Items</h2>

            {/* Scrollable body: will scroll if content exceeds available space */}
            <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
              {itemsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading items...</p>
                </div>
              ) : itemsError ? (
                <div className="text-center py-8 text-red-500">{itemsError}</div>
              ) : saleItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No items found for this sale.</div>
              ) : (
                <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
                  <table className="w-full border border-blue-100 rounded-lg">
                    {/* sticky header so it remains on top when scrolling */}
                    <thead className="bg-blue-50 sticky top-0 z-20">
                       <tr>
                        <th className="p-3 text-left">#</th>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-left">Barcode</th>
                        <th className="p-3 text-left">Qty</th>
                        <th className="p-3 text-left">Price</th>
                        <th className="p-3 text-left">Total Price</th>
                        <th className="p-3 text-left">Discount</th>
                       </tr>
                     </thead>
                     <tbody>
                       {saleItems.map((item, idx) => (
                         <tr key={item.saleItemId} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                           <td className="p-3">{idx + 1}</td>
                           <td className="p-3">{item.productName}</td>
                           <td className="p-3">{item.barcode}</td>
                           <td className="p-3">{item.qty}</td>
                           <td className="p-3">LKR {item.price.toFixed(2)}</td>
                           <td className="p-3">LKR {item.totalPrice.toFixed(2)}</td>
                           <td className="p-3">LKR {item.discount.toFixed(2)}</td>
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

      {/* Receipt Modal for printing — pass saleId so modal fetches full data */}
      {showReceiptModal && modalSaleId !== null && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setModalSaleId(null);
          }}
          saleId={modalSaleId}
        />
      )}
    </div>
  );
};

export default AdminSalesPage;
