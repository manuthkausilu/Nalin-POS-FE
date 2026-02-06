import React from 'react';
import type { SaleReport } from '../../../types/saleReport';

interface ReportTotals {
    itemCount: number;
    originalTotal: number;
    itemDiscounts: number;
    orderDiscount: number;
    totalDiscount: number;
    totalAmount: number;
}

interface ReportTableProps {
    data: SaleReport[];
    totals: ReportTotals;
    loading: boolean;
    title: string;
    formatCurrency: (val: number) => string;
    formatDate: (dateStr: string) => string;
}

const ReportTable: React.FC<ReportTableProps> = ({
    data,
    totals,
    loading,
    title,
    formatCurrency,
    formatDate
}) => {
    return (
        <div id="report-table-container" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Company Header - Only visible in print/PDF */}
            <div 
                className="text-center py-6 border-b-2 border-gray-300"
                style={{ 
                    display: 'none'
                }}
            >
                <style>{`
                    @media print {
                        #company-header {
                            display: block !important;
                        }
                    }
                `}</style>
                <div id="company-header">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        N I テンポ japan shop
                    </h1>
                    <p className="text-sm text-gray-600" style={{ fontSize: '14px', color: '#666' }}>
                        Sales Report
                    </p>
                </div>
            </div>

            <div className="bg-gray-50/50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    {title}
                </h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                    {data.length} Records
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4 text-center">Items</th>
                            <th className="px-6 py-4 text-right">Original</th>
                            <th className="px-6 py-4 text-right text-red-600">Discount</th>
                            <th className="px-6 py-4 text-right">Net Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Loading data...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No sales records found for the selected period.
                                </td>
                            </tr>
                        ) : (
                            <>
                                {data.map((sale) => (
                                    <tr key={sale.saleId} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{sale.saleId}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(sale.saleDate)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                                {sale.itemCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(sale.originalTotal)}</td>
                                        <td className="px-6 py-4 text-right text-red-500">
                                            {sale.totalDiscount > 0 ? `-${formatCurrency(sale.totalDiscount)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(sale.totalAmount)}</td>
                                    </tr>
                                ))}

                                {/* Totals Footer in Table */}
                                <tr className="bg-blue-50 border-t-2 border-blue-200 font-bold text-gray-900">
                                    <td colSpan={2} className="px-6 py-4">TOTALS</td>
                                    <td className="px-6 py-4 text-center">{totals.itemCount}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(totals.originalTotal)}</td>
                                    <td className="px-6 py-4 text-right text-red-600">-{formatCurrency(totals.totalDiscount)}</td>
                                    <td className="px-6 py-4 text-right text-blue-700">{formatCurrency(totals.totalAmount)}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportTable;
