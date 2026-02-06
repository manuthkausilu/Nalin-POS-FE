import React from 'react';
import { FileText, Download } from 'lucide-react';

interface ReportHeaderProps {
    title: string;
    onDownloadPdf: () => void;
    hasData: boolean;
    loading?: boolean;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
    title,
    onDownloadPdf,
    hasData,
    loading
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    {title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    View, print, and download detailed sales reports
                </p>
            </div>

            <div className="flex gap-2">

                <button
                    onClick={onDownloadPdf}
                    disabled={!hasData || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default ReportHeader;
