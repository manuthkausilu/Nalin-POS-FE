import React from 'react';
import { Search, Filter } from 'lucide-react';

export type ReportType = 'daily' | 'monthly' | 'yearly' | 'custom';

interface ReportFiltersProps {
    reportType: ReportType;
    setReportType: (type: ReportType) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    selectedMonth: number;
    setSelectedMonth: (month: number) => void;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    onGenerate: () => void;
    loading: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
    reportType,
    setReportType,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onGenerate,
    loading
}) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center no-print">
            {/* Report Type */}
            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Type</label>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as ReportType)}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-48 appearance-none"
                    >
                        <option value="daily">Daily Report</option>
                        <option value="monthly">Monthly Report</option>
                        <option value="yearly">Yearly Report</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
            </div>

            {/* Dynamic Inputs based on Type */}
            <div className="flex flex-row gap-4 flex-1 w-full md:w-auto">

                {reportType === 'daily' && (
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                )}

                {reportType === 'monthly' && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</label>
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white w-24 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>
                                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {reportType === 'yearly' && (
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Year</label>
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                )}

                {reportType === 'custom' && (
                    <>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="w-full md:w-auto pb-0.5">
                <button
                    onClick={onGenerate}
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all disabled:opacity-70"
                >
                    {loading ? 'Loading...' : (
                        <>
                            <Search className="w-4 h-4" />
                            Generate
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReportFilters;
