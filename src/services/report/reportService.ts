import apiClient from "../ApiClient";
import type { SaleReport } from "../../types/saleReport";
import type { SaleItemReport } from "../../types/saleItemReport";

const BASE_URL = "/admin/reports";

// Sales Reports

export const getDailySales = async (date: string) => {
  try {
    const response = await apiClient.get<SaleReport[]>(`${BASE_URL}/sales/daily`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error(`[ReportService] Fetching daily sales failed for date ${date}:`, error);
    throw error;
  }
};

export const getMonthlySales = async (year: number, month: number) => {
  try {
    const response = await apiClient.get<SaleReport[]>(`${BASE_URL}/sales/monthly`, {
      params: { year, month }
    });
    return response.data;
  } catch (error) {
    console.error(`[ReportService] Fetching monthly sales failed for ${year}-${month}:`, error);
    throw error;
  }
};

export const getYearlySales = async (year: number) => {
  try {
    const response = await apiClient.get<SaleReport[]>(`${BASE_URL}/sales/yearly`, {
      params: { year }
    });
    return response.data;
  } catch (error) {
    console.error(`[ReportService] Fetching yearly sales failed for ${year}:`, error);
    throw error;
  }
};

export const getSalesInRange = async (start: string, end: string) => {
  // Append time if only date is provided
  const formattedStart = start.includes('T') ? start : `${start}T00:00:00`;
  const formattedEnd = end.includes('T') ? end : `${end}T23:59:59`;

  try {
    const response = await apiClient.get<SaleReport[]>(`${BASE_URL}/sales/range`, {
      params: { start: formattedStart, end: formattedEnd }
    });
    return response.data;
  } catch (error) {
    console.error(`[ReportService] Fetching sales in range ${start} to ${end} failed:`, error);
    throw error;
  }
};

// Sale Item Reports

export const getDailySaleItems = async (date: string) => {
  try {
    const response = await apiClient.get<SaleItemReport[]>(`${BASE_URL}/sale-items/daily`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error(`[ReportService] Fetching daily sale items failed for date ${date}:`, error);
    throw error;
  }
};

export const getMonthlySaleItems = async (year: number, month: number) => {
  try {
    const response = await apiClient.get<SaleItemReport[]>(`${BASE_URL}/sale-items/monthly`, {
      params: { year, month }
    });
    return response.data;
  } catch (error) {
    console.error(`[ReportService] Fetching monthly sale items failed for ${year}-${month}:`, error);
    throw error;
  }
};

export const getYearlySaleItems = async (year: number) => {
  try {
    const response = await apiClient.get<SaleItemReport[]>(`${BASE_URL}/sale-items/yearly`, {
      params: { year }
    });
    return response.data;
  } catch (error) {
    console.error(`[ReportService] Fetching yearly sale items failed for ${year}:`, error);
    throw error;
  }
};

export const getSaleItemsInRange = async (start: string, end: string) => {
  // Append time if only date is provided
  const formattedStart = start.includes('T') ? start : `${start}T00:00:00`;
  const formattedEnd = end.includes('T') ? end : `${end}T23:59:59`;

  try {
    const response = await apiClient.get<SaleItemReport[]>(`${BASE_URL}/sale-items/range`, {
      params: { start: formattedStart, end: formattedEnd }
    });
    return response.data;
  } catch (error) {
    console.error(`[ReportService] Fetching sale items in range ${start} to ${end} failed:`, error);
    throw error;
  }
};
