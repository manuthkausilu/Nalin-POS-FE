import { useEffect, useMemo } from "react";
import type { BusinessInfo, Currency, Sale } from "../types/Sale";
//////////////////////////////////////////////////////////////////////////////////

// Import PDF libraries to include in bundle
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
//////////////////////////////////////////////////////////////////////////////////////
const styles = `
/* Center on screen */
.receipt-root { display: flex; justify-content: center; align-items: center; padding: 0; background: #f3f4f6; min-height: 100vh; }

/***** RECEIPT *****/
/* Make receipt fill available width but constrain to paper size */
.receipt { width: 100%; max-width: 80mm !important; min-width: 80mm; background: white; color: #111827; padding: 2mm; box-shadow: 0 4px 18px rgba(0,0,0,.1); margin: 0; }
.receipt * { box-sizing: border-box; }

.header { text-align: center; margin-bottom: 4px; }
.header .title { font-weight: 900; font-size: 24px; letter-spacing: 0.5px; margin-bottom: 2px; }
.header .sub { font-size: 16px; line-height: 1.2; color: #374151; font-weight: 500; margin-bottom: 1px; }

.meta { margin-top: 4px; font-size: 16px; font-weight: 600; }
.row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 2px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.sep { border-top: 2px dashed #9ca3af; margin: 4px 0; }

/***** ITEMS *****/
.items { margin-top: 4px; }
.items-head, .item-row { display: grid; grid-template-columns: 1fr 90px; align-items: start; gap: 10px; }
.items-head { font-weight: 900; font-size: 16px; border-bottom: 2px solid #111827; padding-bottom: 3px; margin-bottom: 4px; }
.item-row { font-size: 16px; margin-bottom: 4px; font-weight: 600; }
.item-name { word-break: break-word; }
.item-name > div:first-child { font-weight: 700; margin-bottom: 1px; font-size: 17px; }
.right { text-align: right !important; justify-self: end; font-weight: 700; }

/***** TOTALS *****/
.totals { font-size: 16px; font-weight: 600; margin-top: 4px; }
.totals .row { margin-top: 3px; }
.totals .row.bold { font-weight: 900; font-size: 20px; }

.footer { text-align: center; margin-top: 6px; font-size: 16px; color: #374151; line-height: 1.3; font-weight: 600; }
.qr { display: flex; justify-content: center; margin-top: 10px; }

/***** PRINTING *****/
@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white;
    width: 80mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .receipt-root {
    display: block !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
  }

  /* Force receipt to use full width of the print area */
  .receipt {
    width: 100% !important;
    max-width: 76mm !important;
    margin: 0 !important;
    padding: 2mm !important;
    box-shadow: none !important;
  }

  /* Allow content to flow naturally - don't force page breaks */
  .item-row {
    page-break-inside: auto;
  }

  .header, .meta, .items-head {
    page-break-after: avoid;
  }

  .totals, .footer {
    page-break-before: avoid;
  }

  .no-print {
    display: none !important;
  }

  /* Minimize margins for continuous flow */
  * {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .header { margin-bottom: 2px !important; }
  .header .title { margin-bottom: 1px !important; }
  .header .sub { margin-bottom: 0 !important; }
  .meta { margin-top: 2px !important; }
  .row { margin-bottom: 1px !important; }
  .item-row { margin-bottom: 2px !important; }
  .sep { margin: 2px 0 !important; }
  .items { margin-top: 2px !important; }
  .items-head { margin-bottom: 2px !important; padding-bottom: 2px !important; }
  .totals { margin-top: 2px !important; }
  .totals .row { margin-top: 1px !important; }
  .footer { margin-top: 4px !important; }
}

@page { 
  size: 80mm auto; 
  margin: 0 !important; 
  padding: 0 !important;
}
`;

// eslint-disable-next-line react-refresh/only-export-components
export const formatMoney = (value: number, currency: Currency = "LKR"): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback if currency code unsupported on some devices
    return `${currency} ${value.toFixed(2)}`;
  }
};

export interface ReceiptProps {
  business: BusinessInfo;
  sale: Sale;
  currency?: Currency;
  autoPrint?: boolean; // Add this prop
  onPrintComplete?: () => void; // Add this prop
}

export default function Receipt(props: ReceiptProps) {
  const {
    business,
    sale,
    currency = "LKR",
    autoPrint = false,
    onPrintComplete
  } = props;

  // No local fetches here: use items array from sale prop; fallback to empty array
  const items = sale.saleItems ?? [];

  // Helper: parse numeric values that might be strings or numbers; return undefined for invalid
  const parseNumber = (v: any): number | undefined => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'number' && !isNaN(v)) return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    }
    return undefined;
  };
  const safeNumber = (v: any, fallback = 0) => {
    const n = parseNumber(v);
    return typeof n === 'number' ? n : fallback;
  };

  // Derived values computed from items (use items instead of sale.saleItems)

  // item count
  const itemCount = useMemo(() => items.length, [items]);

  // original total: prefer sale.originalTotal; otherwise compute from items,
  // where original unit price = (price + discount) and sum (unitOriginal * qty)
  const parsedSaleOriginalTotal = parseNumber(sale.originalTotal);
  const computedOriginalTotal = useMemo(() => {
    return (items ?? []).reduce((s, it) => {
       const unitOriginal = safeNumber(it.price, 0) + safeNumber(it.discount, 0);
       return s + (unitOriginal * safeNumber(it.qty, 0));
    }, 0);
  }, [items]);
  const displayOriginalTotal = safeNumber(parsedSaleOriginalTotal ?? computedOriginalTotal, 0);

  // item discounts total: prefer sale.itemDiscounts -> sale.totalDiscount -> computed sum
  const computedItemDiscounts = useMemo(() => {
    return (items ?? []).reduce((s, it) => {
       return s + (safeNumber(it.discount, 0) * safeNumber(it.qty, 0));
    }, 0);
  }, [items]);
  const parsedSaleItemDiscounts = parseNumber(sale.itemDiscounts ?? sale.totalDiscount);
  const displayItemDiscounts = safeNumber(parsedSaleItemDiscounts ?? computedItemDiscounts, 0);

  // subtotal: prefer sale.subtotal; otherwise originalTotal - itemDiscounts
  const parsedSaleSubtotal = parseNumber(sale.subtotal);
  const computedSubtotal = Math.max(0, displayOriginalTotal - displayItemDiscounts);
  const displaySubtotal = safeNumber(parsedSaleSubtotal ?? computedSubtotal, computedSubtotal);

  // order discount percent and amount: parse and normalize (support 0..1 or 0..100)
  const parsedOrderDiscountPercentage = parseNumber(sale.orderDiscountPercentage) ?? 0;
  const parsedOrderDiscountAmount = parseNumber(sale.orderDiscount);

  const normalizedOrderDiscountPercentage = parsedOrderDiscountPercentage > 0 && parsedOrderDiscountPercentage <= 1
    ? parsedOrderDiscountPercentage * 100
    : parsedOrderDiscountPercentage;
  const decimalOrderDiscountPerc = (normalizedOrderDiscountPercentage / 100);

  const computedOrderDiscountAmount = parsedOrderDiscountAmount ?? Math.round(displaySubtotal * decimalOrderDiscountPerc * 100) / 100;
  const displayOrderDiscountAmount = safeNumber(computedOrderDiscountAmount, 0);
  const displayOrderDiscountPerc = Number(normalizedOrderDiscountPercentage.toFixed(2));

  // grand total: prefer sale.totalAmount; otherwise subtotal - orderDiscount
  const parsedSaleTotalAmount = parseNumber(sale.totalAmount);
  const displayGrandTotal = safeNumber(parsedSaleTotalAmount ?? (displaySubtotal - displayOrderDiscountAmount), Math.max(0, displaySubtotal - displayOrderDiscountAmount));

  // Ensure date string: support sale.saleDate || sale.date || new Date()
  const date = sale.saleDate ?? sale.date ?? new Date();
  const dateStr = useMemo(() => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }, [date]);

  useEffect(() => {
    if (!autoPrint) return;

    // Print using a hidden iframe (matches Receipt.tsx approach)
    const printViaIframe = async () => {
      const receiptEl = document.querySelector('.receipt') as HTMLElement | null;
      if (!receiptEl) return;

      const printHtml = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <style>
              ${styles}
              /* ensure iframe print HTML has no extra side padding */
              html,body { margin:0; padding:0; background:#fff; }
              @page { size: 80mm auto; margin: 0; }
              body { width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .receipt { box-shadow:none; padding:0; width:100%; max-width:78mm; }
            </style>
          </head>
          <body>
            ${receiptEl.outerHTML}
          </body>
        </html>
      `;

      // create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        try { document.body.removeChild(iframe); } catch {
          // ignore cleanup errors
        }
        if (onPrintComplete) onPrintComplete();
        return;
      }

      doc.open();
      doc.write(printHtml);
      doc.close();

      const finish = () => {
        try { document.body.removeChild(iframe); } catch {
          // ignore cleanup errors
        }
        if (onPrintComplete) onPrintComplete();
      };

      const triggerPrint = () => {
        try {
          const w = iframe.contentWindow;
          if (!w) {
            finish();
            return;
          }
          (w as Window & { onafterprint?: () => void }).onafterprint = finish;
          w.focus();
          w.print();
          // fallback in case onafterprint doesn't fire
          setTimeout(finish, 4000);
        } catch {
          finish();
        }
      };

      // wait for load/render
      if ((iframe.contentWindow?.document.readyState) === 'complete') {
        setTimeout(triggerPrint, 250);
      } else {
        iframe.addEventListener('load', () => setTimeout(triggerPrint, 250));
      }
    };

    const timer = window.setTimeout(() => { void printViaIframe(); }, 1200);
    return () => window.clearTimeout(timer);
  }, [autoPrint, onPrintComplete]);
  ///////////////////////////////////////////////////////////////////////////////

  // Note: PDF libraries imported but not used - iframe printing is active
  console.log('PDF libs loaded:', jsPDF, html2canvas);
//////////////////////////////////////////////////////////////////////////////////////
  return (
    <div id="receipt-root" className="receipt-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="receipt" role="document" aria-label="Sales receipt 80mm">
        {/* Header */}
        <div className="header">
          <div className="title">{business.name}</div>
          {business.address && <div className="sub">{business.address}</div>}
          {(business.phone) && (
            <div className="sub">
              {business.phone ? `Tel: ${business.phone}` : ""}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="meta mono">
          <div className="row"><span>Invoice</span><span>#{sale.saleId}</span></div>
          <div className="row"><span>Date</span><span>{dateStr}</span></div>
          <div className="row"><span>Cashier</span><span>{sale.userId ?? ""}</span></div>
          <div className="row"><span>Customer</span><span>{sale.customerId ? String(sale.customerId) : "Walk-in"}</span></div>
        </div>

        <div className="sep" />

        {/* Items */}
        <div className="items">
          <div className="items-head mono">
            <div>Item</div>
            <div className="right">Total</div>
          </div>
          <div className="sep" />
          {items.map((it) => {
             const base = (it.qty ?? 0) * (it.price ?? 0);
             const rawDiscount = safeNumber(it.discount, 0);
             // original unit price shown as price + per-unit discount (same as Receipt.tsx)
             const perUnitOriginal = (it.price ?? 0) + rawDiscount;
             const displayDiscountForItem = rawDiscount * safeNumber(it.qty, 0);
             // Prefer item-level name provided by backend; otherwise fallback to generic product id
             const displayName =
               (it as any).productName ??
               (it as any).name ??
               (it.productId ? `Product ${it.productId}` : "Unnamed Product");
             return (
               <div className="item-row mono" key={it.saleItemId}>
                 <div className="item-name">
                   <div>{displayName}</div>
                   <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 600 }}>
                     {formatMoney(perUnitOriginal, currency)} × {it.qty ?? 0}
                     {displayDiscountForItem > 0 && (
                       <>
                         <br />
                         Disc: {formatMoney(displayDiscountForItem, currency)}
                       </>
                     )}
                   </div>
                 </div>
                 <div className="right">{formatMoney(base, currency)}</div>
               </div>
             );
           })}
        </div>

        <div className="sep" />

        {/* Totals */}
        <div className="totals mono">
          <div className="row"><span>Orginal Total</span><span>{formatMoney(parsedSaleOriginalTotal ?? computedOriginalTotal, currency)}</span></div>
          <div className="row"><span>Item Count</span><span>{itemCount}</span></div>

          {/* Item Discounts - prefer sale.itemDiscounts; show a leading '-' consistent with Receipt.tsx */}
          <div className="row"><span>Item Discounts</span><span>-{formatMoney(safeNumber(parsedSaleItemDiscounts ?? displayItemDiscounts), currency)}</span></div>
          <div className="row"><span>Sub Total</span><span>{formatMoney(parseNumber(sale.subtotal) ?? displaySubtotal, currency)}</span></div>

          {/* Order Discount: match Receipt.tsx logic — show rows only if sale.orderDiscountPercentage > 0 */}
          { (parseNumber(sale.orderDiscountPercentage) ?? 0) > 0 && (
            <>
              <div className="row"><span>Order Discount(%)</span><span>{displayOrderDiscountPerc} %</span></div>
              <div className="row"><span>Order Discount</span><span>-{formatMoney(sale.orderDiscount ?? displayOrderDiscountAmount, currency)}</span></div>
            </>
          )}

           <div className="sep" />
          <div className="row bold"><span>Grand Total</span><span>{formatMoney(safeNumber(parseNumber(sale.totalAmount) ?? displayGrandTotal), currency)}</span></div>
           <div className="sep" />
          <div className="row"><span>Pay Amount</span><span>{formatMoney(safeNumber(parseNumber(sale.paymentAmount) ?? 0), currency)}</span></div>
          <div className="row"><span>Balance</span><span>{formatMoney(safeNumber(parseNumber(sale.balance) ?? 0), currency)}</span></div>
        </div>

        <div className="footer"><strong>ご購入ありがとうございました！</strong><br />Thank you for your purchase!</div>

        {/* Optional QR/Barcode slot */}
      </div>

    </div>
  );
}