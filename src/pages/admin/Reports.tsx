import React, { useState, useEffect } from 'react';
import {
  getDailySalesSummary,
  getWeeklySalesSummary,
  getMonthlySalesSummary,
  getCustomSalesSummary
} from '../../services/SalesAnalyticsService';
import {
  getDailyProfitSummary,
  getWeeklyProfitSummary,
  getMonthlyProfitSummary,
  getCustomProfitSummary
} from '../../services/ProfitCalService';
import { getStockOverview } from '../../services/StockOverview';

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState('week');
  const [salesData, setSalesData] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [stockOverview, setStockOverview] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockOverview = async () => {
      setStockLoading(true);
      setStockError(null);
      try {
        const response = await getStockOverview();
        setStockOverview(response?.stockOverviewDTO ?? null);
      } catch (err: any) {
        setStockError(err.message || 'Failed to fetch stock overview');
        setStockOverview(null);
      }
      setStockLoading(false);
    };
    fetchStockOverview();
  }, []);

  const fetchSalesReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (dateRange === 'today') {
        response = await getDailySalesSummary();
      } else if (dateRange === 'week') {
        response = await getWeeklySalesSummary();
      } else if (dateRange === 'month') {
        response = await getMonthlySalesSummary();
      } else if (dateRange === 'year') {
        response = await getMonthlySalesSummary();
      } else if (dateRange === 'custom') {
        response = await getCustomSalesSummary(customStart, customEnd);
      }
      setSalesData(response?.data ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report');
      setSalesData(null);
    }
    setLoading(false);
  };

  const fetchProfitReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (dateRange === 'today') {
        response = await getDailyProfitSummary();
      } else if (dateRange === 'week') {
        response = await getWeeklyProfitSummary();
      } else if (dateRange === 'month') {
        response = await getMonthlyProfitSummary();
      } else if (dateRange === 'year') {
        response = await getMonthlyProfitSummary();
      } else if (dateRange === 'custom') {
        response = await getCustomProfitSummary(customStart, customEnd);
      }
      setProfitData(response?.data ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profit report');
      setProfitData(null);
    }
    setLoading(false);
  };

  const handleGenerateReport = () => {
    if (selectedReport === 'sales') {
      fetchSalesReport();
    } else if (selectedReport === 'profit') {
      fetchProfitReport();
    }
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      {/* <h1 className="text-3xl font-bold mb-8 text-center text-black">Reports Dashboard</h1> */}

      {/* Stock Overview Section */}
      <div className="bg-white rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center  justify-center gap-20 border">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black">Total Products Quantity</h3>
            <p className="text-3xl font-bold text-black">
              {stockLoading ? '...' : stockOverview?.totalProductsQty ?? 0}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-black text-white rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black">Total Stock Value</h3>
            <p className="text-3xl font-bold text-black">
              {stockLoading ? '...' : stockOverview?.totalPrice ? `LKR ${stockOverview.totalPrice}` : 'LKR 0'}
            </p>
          </div>
        </div>
        {stockError && <div className="text-red-500 mt-4">{stockError}</div>}
        {!stockOverview && !stockLoading && !stockError && (
          <div className="text-gray-500 mt-4">No data available.</div>
        )}
      </div>

      {/* Reports Section */}
      <div className="bg-white rounded-xl p-8 border">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="border rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-300 text-black bg-white"
          >
            <option value="sales">Sales Report</option>
            <option value="profit">Profit Report</option>
            {/* <option value="inventory">Inventory Report</option>
            <option value="users">User Activity Report</option> */}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-300 text-black bg-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            {/* <option value="year">This Year</option> */}
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="border rounded-md shadow-sm p-2 text-black bg-white"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="border rounded-md shadow-sm p-2 text-black bg-white"
                placeholder="End Date"
              />
            </div>
          )}

          <button
            className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>

        {/* Report Content */}
        <div>
          {selectedReport === 'sales' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-black">Sales Report</h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {!salesData && !loading && (
                <div className="text-gray-500 mb-4">No data. Click "Generate Report".</div>
              )}
              {salesData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg flex flex-col items-center border">
                    <span className="text-black mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2M5 9v10a2 2 0 002 2h10a2 2 0 002-2V9" />
                      </svg>
                    </span>
                    <h3 className="text-sm text-black">Total Transactions</h3>
                    <p className="text-2xl font-bold text-black">
                      {salesData.totalTransactions ?? 0}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg flex flex-col items-center border">
                    <span className="text-black mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                    </span>
                    <h3 className="text-sm text-black">Average Transaction Value</h3>
                    <p className="text-2xl font-bold text-black">
                      {salesData.averageTransactionValue ? `LKR ${salesData.averageTransactionValue}` : 'LKR 0'}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg flex flex-col items-center border">
                    <span className="text-black mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                      </svg>
                    </span>
                    <h3 className="text-sm text-black">Total Revenue</h3>
                    <p className="text-2xl font-bold text-black">
                      {salesData.totalRevenue ? `LKR ${salesData.totalRevenue}` : 'LKR 0'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedReport === 'profit' && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-black">Profit Report</h2>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {!profitData && !loading && (
                <div className="text-gray-500 mb-4">No data. Click "Generate Report".</div>
              )}
              {profitData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg flex flex-col items-center border">
                    <span className="text-black mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                      </svg>
                    </span>
                    <h3 className="text-sm text-black">Net Profit</h3>
                    <p className="text-2xl font-bold text-black">
                      {profitData.netProfit ? `LKR ${profitData.netProfit}` : 'LKR 0'}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg flex flex-col items-center border">
                    <span className="text-black mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                      </svg>
                    </span>
                    <h3 className="text-sm text-black">Total Revenue</h3>
                    <p className="text-2xl font-bold text-black">
                      {profitData.totalRevenue ? `LKR ${profitData.totalRevenue}` : 'LKR 0'}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg flex flex-col items-center border">
                    <span className="text-black mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                      </svg>
                    </span>
                    <h3 className="text-sm text-black">Total Cost</h3>
                    <p className="text-2xl font-bold text-black">
                      {profitData.totalCost ? `LKR ${profitData.totalCost}` : 'LKR 0'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedReport === 'inventory' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-black">Inventory Report</h2>
              {/* Add inventory report content */}
            </div>
          )}

          {selectedReport === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-black">User Activity Report</h2>
              {/* Add user activity report content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;