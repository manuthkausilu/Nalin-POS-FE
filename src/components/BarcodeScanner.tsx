import React, { useEffect, useState } from 'react';

interface BarcodeScannerProps {
  onClose: () => void;
  onScan: (barcode: string) => void;
  isOpen: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;  // Add this prop
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, onScan, isOpen, inputRef }) => {
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    if (isOpen && inputRef?.current) {
      inputRef.current.focus();
    }
  }, [isOpen, inputRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode) {
      onScan(barcode);
      setBarcode('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Scan Barcode</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}  // Add the ref here
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Scan or type barcode..."
            autoFocus
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};

export default BarcodeScanner;
