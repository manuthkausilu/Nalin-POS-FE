import React, { useEffect } from 'react';
import Receipt from '../util/Receipt';
import type { Sale } from '../types/Sale';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
    if (!isOpen) return null;

    const businessInfo = {
        name: "N I テンポ japan shop",
        address: "573/E1/1 colombo road, gonapola",
        phone: "+94 71 1602 253",
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 10000);

        return () => clearTimeout(timer);
    }, [onClose]);

    useEffect(() => {
        console.log("sale data in receipt modal:", sale);
    }, [sale]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'visible',
            padding: '20px'
        }}>
            <div style={{ 
                backgroundColor: 'white',
                width: '72mm',  // Standard thermal paper width
                margin: '0 auto',
                overflow: 'visible'
            }}>
                <Receipt 
                    business={businessInfo}
                    sale={sale}
                    autoPrint={true}
                    onPrintComplete={onClose}
                />
            </div>
        </div>
    );
};

export default ReceiptModal;
