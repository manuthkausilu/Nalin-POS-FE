# Product Reports Feature

## Overview
Created a comprehensive Product Sales Reports feature that displays product-level sales data with filtering options.

## What Was Created

### 1. **Service Layer** (`reportService.ts`)
- Fixed `getSaleItemsInRange()` to properly format dates with timestamps
- Existing endpoints are ready to use:
  - `getDailySaleItems(date)` - Daily product sales
  - `getMonthlySaleItems(year, month)` - Monthly product sales
  - `getYearlySaleItems(year)` - Yearly product sales
  - `getSaleItemsInRange(start, end)` - Custom date range

### 2. **New Page** (`ProductReports.tsx`)
Created a full-featured product reports page with:

#### Features:
- **Multiple Report Types:**
  - Daily reports
  - Monthly reports
  - Yearly reports
  - Custom date range reports

- **Summary Cards:**
  - Total Products sold
  - Total Quantity Sold
  - Total Discounts
  - Net Total Amount

- **Data Table:**
  - Product ID
  - Product Name
  - Quantity Sold
  - Sale Price
  - Total Price
  - Discount
  - Total Amount
  - Footer with totals row

- **PDF Download:**
  - Professional PDF generation
  - Multi-page support for long reports
  - Includes summary and complete data table
  - Auto-named with report type and date

- **UI Features:**
  - Loading states
  - Error handling
  - Responsive design
  - Hover effects
  - Empty state messages

### 3. **Routing** (`router.tsx`)
- Added route: `/admin/product-reports`
- Accessible from admin dashboard

### 4. **Navigation** (`AdminSidebar.tsx`)
- Added "Product Reports" menu item
- Uses `MdBarChart` icon
- Positioned after "Invoices" in sidebar

## Data Structure

The API returns data in this format:
```json
[
  {
    "productId": 1,
    "productName": "Test",
    "qty": 35,
    "salePrice": 200.00,
    "totalPrice": 7000.00,
    "discount": 120.00,
    "totalAmount": 6880.00
  }
]
```

## How to Use

1. Navigate to **Admin Dashboard** → **Product Reports** in the sidebar
2. Select report type (Daily/Monthly/Yearly/Custom)
3. Choose date/date range
4. Click "Generate Report"
5. View the data in the table
6. Click "Download PDF" to export the report

## Technical Details

- **Type Safety:** Uses `SaleItemReport` interface
- **Currency Formatting:** LKR (Sri Lankan Rupee)
- **PDF Library:** jsPDF + html2canvas
- **State Management:** React hooks (useState, useEffect, useMemo)
- **Styling:** Tailwind CSS with gradient cards

## API Endpoints Used

All endpoints are under `/admin/reports/sale-items/`:
- `GET /daily?date=YYYY-MM-DD`
- `GET /monthly?year=YYYY&month=MM`
- `GET /yearly?year=YYYY`
- `GET /range?start=YYYY-MM-DDT00:00:00&end=YYYY-MM-DDT23:59:59`
