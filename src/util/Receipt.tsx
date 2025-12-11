import { useEffect, useMemo, useState } from "react";
import type { User } from "../types/User";
import { getUserById } from "../services/UserService";
import type { Customer } from "../types/Customer";
import { getCustomerById } from "../services/CustomerService";
import { getProductById } from "../services/ProductService";
import type { Product } from "../types/Product";
import type { BusinessInfo, Currency, Sale } from "../types/Sale";

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
    onPrintComplete, // restored so callback is invoked after print
  } = props;

  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [itemCount, setItemCount] = useState<number>(0);

  useEffect(() => {
    // Fetch user data or any other side effects
    const loadData = async () => {
      try {
        // Load user and customer data
        const userData = await getUserById(sale.userId);
        console.log("User Data:", userData);
        setUser(userData.userDTO);

        if (sale.customerId !== 0) {
          const customerData = await getCustomerById(sale.customerId);
          console.log("Customer Data:", customerData);
          setCustomer(customerData.customerDTO);
        }

        // Load product data for each item
        const productPromises = sale.saleItems.map(async (item) => {
          const product = await getProductById(item.productId);
          console.log("Product Data:", product);
          return [item.productId, product.productDTO] as const;
        });

        const productResults = await Promise.all(productPromises);
        const productMap = Object.fromEntries(productResults) as Record<string, Product>;
        setProducts(productMap);
      } catch (error) {
        console.error("Error loading receipt data:", error);
      }
    };

    void loadData();

    setItemCount(sale.saleItems.length);
    console.log("Sale Data:", sale);
  }, [sale]);

  const date = sale.date || new Date();

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

    // Print using a hidden iframe (no new tab opened)
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
          <div className="row"><span>Cashier</span><span>{user?.userName}</span></div>
          {customer && (
            <>
              <div className="row"><span>Customer</span><span>{customer.customerName ?? "Walk-in"}</span></div>
              {customer.phone && <div className="row"><span>Phone</span><span>{customer.phone}</span></div>}
            </>
          )}
        </div>

        <div className="sep" />

        {/* Items */}
        <div className="items">
          <div className="items-head mono">
            <div>Item</div>
            {/* <div className="right">Qty</div> */}
            <div className="right">Total</div>
          </div>
          {sale.saleItems.map((it) => {
            const product = products[it.productId]; // fetched product
            const base = it.qty * it.price; // qty * price
            const discount = it.discount ?? 0;

            return (
              <div className="item-row mono" key={it.saleItemId}>
                <div className="item-name">
                  <div>{product?.productName || `Product ${it.productId}`}</div>
                  <div style={{ color: "#4b5563", fontSize: 14, fontWeight: 600 }}>
                    {formatMoney(it.price + (it.discount ?? 0), currency)} × {it.qty}
                    {discount > 0 && (
                      <>
                        <br />
                        Disc: {formatMoney((discount * it.qty), currency)}
                      </>
                    )}
                  </div>
                </div>
                {/* <div className="right">{it.qty}</div> */}
                <div className="right">{formatMoney(base, currency)}</div>
              </div>
            );
          })}

        </div>

        <div className="sep" />

        {/* Totals */}
        <div className="totals mono">
          <div className="row"><span>Orginal Total</span><span>{formatMoney(sale.originalTotal, currency)}</span></div>
          <div className="row"><span>Item Count</span><span>{itemCount}</span></div>
          <div className="row"><span>Item Discounts</span><span>-{formatMoney(sale.itemDiscounts, currency)}</span></div>
          <div className="row"><span>Sub Total</span><span>{formatMoney(sale.subtotal, currency)}</span></div>
          {sale.orderDiscountPercentage > 0 && (
            <>
              <div className="row"><span>Order Discount(%)</span><span>{sale.orderDiscountPercentage} %</span></div>
              <div className="row"><span>Order Discount</span><span>-{formatMoney(sale.orderDiscount, currency)}</span></div>
            </>
          )}
          <div className="sep" />
          <div className="row bold"><span>Grand Total</span><span>{formatMoney(sale.totalAmount, currency)}</span></div>
          <div className="sep" />
          <div className="row"><span>Pay Amount</span><span>{formatMoney(sale.paymentAmount, currency)}</span></div>
          <div className="row"><span>Balance</span><span>{formatMoney(sale.balance, currency)}</span></div>
        </div>

        <div className="footer"><strong>ご購入ありがとうございました！</strong><br />Thank you for your purchase!</div>

        {/* Optional QR/Barcode slot (image source can be injected by parent) */}
        {/* <div className="qr"><img src={qrSrc} alt="QR" width={120} height={120} /></div> */}
      </div>

    </div>
  );
}