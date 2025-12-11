import React from 'react';

interface HeaderSectionProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  search: string;
  setSearch: (search: string) => void;
  onBarcodeClick: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  viewMode,
  setViewMode,
  search,
  setSearch,
  onBarcodeClick
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg px-4 py-2 border border-gray-200 flex items-center justify-between gap-2">
      <div className="flex items-center gap-4">
        <button
          onClick={onBarcodeClick}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
        >
          Scan Barcode
        </button>

        <div className="bg-gray-100 rounded p-1 flex border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded transition-all duration-300 text-sm font-medium ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <span className="inline-block mr-1 align-middle">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/>
                <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/>
                <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor"/>
                <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor"/>
              </svg>
            </span>
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded transition-all duration-300 text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <span className="inline-block mr-1 align-middle">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="4" rx="2" fill="currentColor"/>
                <rect x="3" y="15" width="18" height="4" rx="2" fill="currentColor"/>
              </svg>
            </span>
            List
          </button>
        </div>
      </div>
      
      <div className="flex items-center ml-4 flex-1 max-w-lg">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-base bg-gray-50"
        />
      </div>
    </div>
  );
};

export default HeaderSection;