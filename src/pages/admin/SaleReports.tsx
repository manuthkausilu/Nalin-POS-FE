import React, { useState, useEffect, useMemo } from 'react';
import {
    getDailySales,
    getMonthlySales,
    getYearlySales,
    getSalesInRange
} from '../../services/report/reportService';
import type { SaleReport } from '../../types/saleReport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportHeader from '../../components/admin/reports/ReportHeader';
import ReportFilters, { type ReportType } from '../../components/admin/reports/ReportFilters';
import ReportTable from '../../components/admin/reports/SalesReportTable';

const Invoices: React.FC = () => {
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

    const [salesData, setSalesData] = useState<SaleReport[]>([]);
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
            let data: SaleReport[] = [];

            switch (reportType) {
                case 'daily':
                    data = await getDailySales(selectedDate);
                    break;
                case 'monthly':
                    data = await getMonthlySales(selectedYear, selectedMonth);
                    break;
                case 'yearly':
                    data = await getYearlySales(selectedYear);
                    break;
                case 'custom':
                    if (startDate && endDate) {
                        data = await getSalesInRange(startDate, endDate);
                    }
                    break;
            }
            setSalesData(data);
        } catch (err: any) {
            console.error("Error fetching report:", err);
            setError("Failed to load sales data. Please try again.");
            setSalesData([]);
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

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate Totals
    const totals = useMemo(() => {
        return salesData.reduce((acc, curr) => ({
            itemCount: acc.itemCount + curr.itemCount,
            originalTotal: acc.originalTotal + curr.originalTotal,
            itemDiscounts: acc.itemDiscounts + curr.itemDiscounts,
            orderDiscount: acc.orderDiscount + curr.orderDiscount,
            totalDiscount: acc.totalDiscount + curr.totalDiscount,
            totalAmount: acc.totalAmount + curr.totalAmount
        }), {
            itemCount: 0,
            originalTotal: 0,
            itemDiscounts: 0,
            orderDiscount: 0,
            totalDiscount: 0,
            totalAmount: 0
        });
    }, [salesData]);

    const titleText = useMemo(() => {
        if (reportType === 'daily') return `Daily Sales Report - ${selectedDate}`;
        if (reportType === 'monthly') return `Monthly Sales Report - ${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        if (reportType === 'yearly') return `Yearly Sales Report - ${selectedYear}`;
        if (reportType === 'custom') return `Sales Report (${startDate} to ${endDate})`;
        return 'Sales Report';
    }, [reportType, selectedDate, selectedMonth, selectedYear, startDate, endDate]);



    const handleDownloadPdf = async () => {
        if (loading || salesData.length === 0) {
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
                            <div><strong>Total Transactions:</strong> ${salesData.length}</div>
                            <div><strong>Total Items:</strong> ${totals.itemCount}</div>
                            <div><strong>Original Total:</strong> ${formatCurrency(totals.originalTotal)}</div>
                            <div><strong>Total Discounts:</strong> ${formatCurrency(totals.totalDiscount)}</div>
                            <div style="grid-column: span 2;"><strong style="font-size: 16px;">Grand Total:</strong> <span style="font-size: 16px; color: #1e40af;">${formatCurrency(totals.totalAmount)}</span></div>
                        </div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px;">
                        <thead>
                            <tr style="background-color: #1e40af; color: white;">
                                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Invoice #</th>
                                <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Date</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Items</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Original</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Discount</th>
                                <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${salesData.map((sale, index) => `
                                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                                    <td style="padding: 6px 8px; border: 1px solid #ddd;">${sale.saleId}</td>
                                    <td style="padding: 6px 8px; border: 1px solid #ddd;">${formatDate(sale.saleDate)}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${sale.itemCount}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(sale.originalTotal)}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(sale.totalDiscount)}</td>
                                    <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd; font-weight: bold;">${formatCurrency(sale.totalAmount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #1e40af; color: white; font-weight: bold;">
                                <td colspan="2" style="padding: 8px; border: 1px solid #ddd;">TOTAL</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${totals.itemCount}</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(totals.originalTotal)}</td>
                                <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(totals.totalDiscount)}</td>
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
            const fileName = `Sales_Report_${titleText.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div id="report-page-container" className="p-6 bg-gray-50/50 min-h-screen space-y-6">

            <ReportHeader
                title="Sales Reports"

                onDownloadPdf={handleDownloadPdf}
                hasData={salesData.length > 0}
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

            {!loading && salesData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-blue-100 text-sm font-medium mb-1">Total Transactions</p>
                        <p className="text-3xl font-bold">{salesData.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-purple-100 text-sm font-medium mb-1">Total Items</p>
                        <p className="text-3xl font-bold">{totals.itemCount}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-amber-100 text-sm font-medium mb-1">Total Discounts</p>
                        <p className="text-3xl font-bold">{formatCurrency(totals.totalDiscount)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-blue-100 text-sm font-medium mb-1">Grand Total</p>
                        <p className="text-3xl font-bold">{formatCurrency(totals.totalAmount)}</p>
                    </div>
                </div>
            )}

            <ReportTable
                data={salesData}
                totals={totals}
                loading={loading}
                title={titleText}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />
        </div>
    );
};

export default Invoices;