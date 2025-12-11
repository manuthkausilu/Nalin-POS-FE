import apiClient from "./ApiClient";
import type { SaleDTO } from "../types/Sale";
export const saveSale = async (saleData: SaleDTO) => {
  try {
    const response = await apiClient.post("/sales", saleData);
    return response.data;
  } catch (error) {
    console.error("Saving sale failed:", error);
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
    const response = await apiClient.put(`/sales/${id}`, saleData);
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
