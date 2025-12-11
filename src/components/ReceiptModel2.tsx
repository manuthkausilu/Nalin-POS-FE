import React, { useEffect, useState } from 'react';
import Receipt from '../util/Reciept2';
import type { Sale } from '../types/Sale';
import { getSaleById } from '../services/SaleService';
import { getAllSaleItemsBySaleId } from '../services/SaleItemService';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleId: number;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, saleId }) => {
    if (!isOpen) return null;

    const businessInfo = {
        name: "N I テンポ japan shop",
        address: "573/E1/1 colombo road, gonapola",
        phone: "+94 71 1602 253",
    };

    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setErr(null);
            setLoading(true);
            try {
                // fetch sale record
                const res = await getSaleById(saleId);
                const saleDTO = res.saleDTO ?? res;

                // fetch sale items
                const siResp = await getAllSaleItemsBySaleId(saleId);
                const siList = Array.isArray(siResp?.saleItemDTOList) ? siResp.saleItemDTOList : [];

                const mappedItems = siList.map((it: any) => ({
                    saleItemId: it.saleItemId,
                    saleId: it.saleId,
                    productId: it.productId,
                    productName: it.productName ?? it.name ?? undefined,
                    qty: it.qty,
                    price: it.price,
                    discount: it.discount ?? 0,
                }));

                const prepared = {
                    // Coerce fields to match Sale type where possible
                    ...saleDTO,
                    saleId: saleDTO.saleId,
                    saleDate: saleDTO.saleDate,
                    totalAmount: saleDTO.totalAmount,
                    totalDiscount: saleDTO.totalDiscount,
                    paymentMethod: saleDTO.paymentMethod,
                    userId: saleDTO.userId,
                    customerId: saleDTO.customerId,
                    saleItems: mappedItems,
                    originalTotal: saleDTO.originalTotal,
                    itemDiscounts: saleDTO.itemDiscounts,
                    subtotal: saleDTO.subtotal,
                    orderDiscountPercentage: saleDTO.orderDiscountPercentage,
                    orderDiscount: saleDTO.orderDiscount,
                    paymentAmount: saleDTO.paymentAmount,
                    balance: saleDTO.balance,
                } as Sale;

                if (mounted) setSale(prepared);
            } catch (error: any) {
                if (mounted) setErr(error.message || 'Failed to load sale');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        void load();
        return () => { mounted = false; };
    }, [saleId]);

    useEffect(() => {
        // removed auto-close timer — modal closes via onPrintComplete callback from Receipt
    }, [onClose]);

    useEffect(() => {
        console.log("saleId in receipt modal:", saleId);
    }, [saleId]);

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
                width: '80mm',  // Adjust to standard paper width
                margin: '0 auto',
                overflow: 'visible'
            }}>
                {loading ? (
                    <div style={{ padding: 20 }}>Loading receipt...</div>
                ) : err ? (
                    <div style={{ padding: 20, color: 'red' }}>Error loading receipt: {err}</div>
                ) : sale ? (
                    <Receipt 
                        business={businessInfo}
                        sale={sale}
                        autoPrint={true}
                        onPrintComplete={onClose}
                    />
                ) : (
                    <div style={{ padding: 20 }}>No sale data</div>
                )}
            </div>
        </div>
    );
};

export default ReceiptModal;
