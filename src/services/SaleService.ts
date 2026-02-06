import apiClient from "./ApiClient";
import type { SaleDTO } from "../types/Sale";
// Helper: ensure each saleItem has a correct totalPrice (qty * unitPrice)
const computeSaleTotals = (saleData: any) => {
  if (!saleData || !Array.isArray(saleData.saleItems)) return saleData;
  const updatedItems = saleData.saleItems.map((item: any) => {
    const qty = Number(item.quantity ?? item.qty ?? 0) || 0;
    const unit = Number(item.unitPrice ?? item.price ?? item.sellingPrice ?? 0) || 0;
    const totalPrice = Number((qty * unit).toFixed(2));
    return {
      ...item,
      quantity: qty,
      totalPrice,
    };
  });
  return { ...saleData, saleItems: updatedItems };
};

export const saveSale = async (saleData: SaleDTO) => {
  try {
    const payload = computeSaleTotals({ ...saleData });
    // Log outgoing request payload and timestamp
    console.info('[SaleService] Sending sale request to /sales at', new Date().toISOString(), payload);
    const response = await apiClient.post("/sales", payload);
    // Log response details
    console.info('[SaleService] Received response for /sales:', { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    // Include payload in error log for easier debugging
    console.error('[SaleService] Saving sale failed. Payload:', saleData, 'Error:', error);
    throw error;
  }
};

export const getAllSales = async () => {
  try {
    const response = await apiClient.get("/sales");
    return response.data;
  } catch (error) {
    console.error("Fetching sales failed:", error);
    throw error;
  }
};

export const getSaleById = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetching sale by ID failed:", error);
    throw error;
  }
};

export const getSaleByUserId = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/sales/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetching sale by ID failed:", error);
    throw error;
  }
};

export const updateSale = async (id: string | number, saleData: any) => {
  try {
    const payload = computeSaleTotals({ ...saleData });
    const response = await apiClient.put(`/sales/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Updating sale failed:", error);
    throw error;
  }
};

export const deleteSale = async (id: string | number) => {
  try {
    const response = await apiClient.delete(`/admin/sales/${id}`);
    return response.data;
  } catch (error) {
    console.error("Deleting sale failed:", error);
    throw error;
  }
};

export const getSalesByDateRange = async (startDate: string, endDate: string) => {
  try {
    const response = await apiClient.get(`/sales/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error("Fetching sales by date range failed:", error);
    throw error;
  }
};

export const getAdminSalesStats = async () => {
  try {
    const response = await apiClient.get('/sales/stats');
    return response.data;
  } catch (error) {
    console.error("Fetching sales stats failed:", error);
    throw error;
  }
};

export const getSalesToday = async () => {
  try {
    const response = await apiClient.get('/sales/date-range?rangeType=today');
    return response.data;
  } catch (error) {
    console.error("Fetching today's sales failed:", error);
    throw error;
  }
};

export const getSalesLastWeek = async () => {
  try {
    const response = await apiClient.get('/sales/date-range?rangeType=lastweek');
    return response.data;
  } catch (error) {
    console.error("Fetching last week's sales failed:", error);
    throw error;
  }
};

export const getSalesLastMonth = async () => {
  try {
    const response = await apiClient.get('/sales/date-range?rangeType=lastmonth');
    return response.data;
  } catch (error) {
    console.error("Fetching last month's sales failed:", error);
    throw error;
  }
};

export const getSalesCustomRange = async (startDate: string, endDate: string) => {
  try {
    const response = await apiClient.get(`/sales/date-range?rangeType=custom&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error("Fetching custom range sales failed:", error);
    throw error;
  }
};
