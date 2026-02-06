import React, { useState, useEffect, useMemo } from 'react';
import {
    getDailySaleItems,
    getMonthlySaleItems,
    getYearlySaleItems,
    getSaleItemsInRange
} from '../../services/report/reportService';
import type { SaleItemReport } from '../../types/saleItemReport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportHeader from '../../components/admin/reports/ReportHeader';
import ReportFilters, { type ReportType } from '../../components/admin/reports/ReportFilters';

const ProductReports: React.FC = () => {
    // Helper function to get today's date in local timezone
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [reportType, setReportType] = useState<ReportType>('daily');
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [productData, setProductData] = useState<SaleItemReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        handleGenerateReport();
    }, []);

    // Reset to today's date when switching to daily report
    useEffect(() => {
        if (reportType === 'daily') {
            setSelectedDate(getTodayDate());
        }
    }, [reportType]);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            let data: SaleItemReport[] = [];

            switch (reportType) {
                case 'daily':
                    data = await getDailySaleItems(selectedDate);
                    break;
                case 'monthly':
                    data = await getMonthlySaleItems(selectedYear, selectedMonth);
                    break;
                case 'yearly':
                    data = await getYearlySaleItems(selectedYear);
                    break;
                case 'custom':
                    if (startDate && endDate) {
                        data = await getSaleItemsInRange(startDate, endDate);
                    }
                    break;
            }
            setProductData(data);
        } catch (err: any) {
            console.error("Error fetching product report:", err);
            setError("Failed to load product data. Please try again.");
            setProductData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        fetchReport();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).format(val);
    };

    // Calculate Totals
    const totals = useMemo(() => {
        return productData.reduce((acc, curr) => ({
            qty: acc.qty + curr.qty,
            totalPrice: acc.totalPrice + curr.totalPrice,
            discount: acc.discount + curr.discount,
            totalAmount: acc.totalAmount + curr.totalAmount
        }), {
            qty: 0,
            totalPrice: 0,
            discount: 0,
            totalAmount: 0
        });
    }, [productData]);

    const titleText = useMemo(() => {
        if (reportType === 'daily') return `Daily Product Sales - ${selectedDate}`;
        if (reportType === 'monthly') return `Monthly Product Sales - ${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        if (reportType === 'yearly') return `Yearly Product Sales - ${selectedYear}`;
        if (reportType === 'custom') return `Product Sales (${startDate} to ${endDate})`;
        return 'Product Sales Report';
    }, [reportType, selectedDate, selectedMonth, selectedYear, startDate, endDate]);

    const handleDownloadPdf = async () => {
        if (loading || productData.length === 0) {
            alert("No data available to download");
            return;
        }

        try {
            // Create a temporary container for PDF content
            const printContainer = document.createElement('div');
            printContainer.style.position = 'absolute';
            printContainer.style.left = '-9999px';
            printContainer.style.top = '0';
            printContainer.style.width = '210mm'; // A4 width
            printContainer.style.backgroundColor = 'white';
            printContainer.style.padding = '20px';
            document.body.appendChild(printContainer);

            // Build the report content
            printContainer.innerHTML = `
                <div style="font-family: Arial, sans-serif;">
                    <!-- Company Header -->
                    <div style="text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; color: #1e40af; font-weight: bold;">N I テンポ japan shop</h1>
                    </div>

                    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
                        <h2 style="margin: 0; font-size: 20px; color: #333;">${titleText}</h2>
                        <p style="margin: 5px 0; color: #666; font-size: 12px;">Generated on ${new Date().toLocaleString()}</p>
                    </div>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 16px;">Summary</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 14px;">
                            <div><strong>Total Products:</strong> ${productData.length}</div>
                            <div><strong>Total Quantity Sold:</strong> ${totals.qty}</div>
                            <div><strong>Total Sales:</strong> ${formatCurrency(totals.totalPrice)}</div>
                            <div><strong>Total Discounts:</strong> ${formatCurrency(totals.discount)}</div>
                            <div style="grid-column: span 2;"><strong style="font-size: 16px;">Net Total:</strong> <span style="font-size: 16px; color: #1e40af;">${formatCurrency(totals.totalAmount)}</span></div>
                        </div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px;">
                        <thead>
                            <tr style="background-color: #1e40af; color: white;">
                                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product ID</th>
                                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product Name</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Qty Sold</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Sale Price</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Total Price</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Discount</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productData.map((product, index) => `
                                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                                    <td style="padding: 6px 8px; border: 1px solid #ddd;">${product.productId || 'N/A'}</td>
                                    <td style="padding: 6px 8px; border: 1px solid #ddd;">${product.productName}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${product.qty}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(product.salePrice)}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(product.totalPrice)}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(product.discount)}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd; font-weight: bold;">${formatCurrency(product.totalAmount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #1e40af; color: white; font-weight: bold;">
                                <td colspan="2" style="padding: 8px; border: 1px solid #ddd;">TOTAL</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${totals.qty}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;"></td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(totals.totalPrice)}</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(totals.discount)}</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(totals.totalAmount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;

            // Generate PDF from the temporary container
            const canvas = await html2canvas(printContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate image dimensions to fit page width
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            // Handle multi-page if content is longer than one page
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            // Clean up
            document.body.removeChild(printContainer);

            // Save the PDF
            const fileName = `Product_Sales_Report_${titleText.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div id="product-report-page-container" className="p-6 bg-gray-50/50 min-h-screen space-y-6">

            <ReportHeader
                title="Product Sales Reports"
                onDownloadPdf={handleDownloadPdf}
                hasData={productData.length > 0}
                loading={loading}
            />

            <ReportFilters
                reportType={reportType}
                setReportType={setReportType}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onGenerate={handleGenerateReport}
                loading={loading}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {!loading && productData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Products</p>
                        <p className="text-3xl font-bold">{productData.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-purple-100 text-sm font-medium mb-1">Quantity Sold</p>
                        <p className="text-3xl font-bold">{totals.qty}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-amber-100 text-sm font-medium mb-1">Total Discounts</p>
                        <p className="text-3xl font-bold">{formatCurrency(totals.discount)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-blue-100 text-sm font-medium mb-1">Net Total</p>
                        <p className="text-3xl font-bold">{formatCurrency(totals.totalAmount)}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{titleText}</h2>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : productData.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg font-medium">No data available</p>
                            <p className="text-sm mt-1">Select filters and click "Generate Report" to view data</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty Sold</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Sale Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {productData.map((product, index) => (
                                    <tr key={`${product.productId}-${index}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">{product.productId || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.productName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{product.qty}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(product.salePrice)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(product.totalPrice)}</td>
                                        <td className="px-6 py-4 text-sm text-red-600 text-right">{formatCurrency(product.discount)}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(product.totalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900">TOTAL</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{totals.qty}</td>
                                    <td className="px-6 py-4"></td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(totals.totalPrice)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600 text-right">{formatCurrency(totals.discount)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-blue-700 text-right text-lg">{formatCurrency(totals.totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReports;
