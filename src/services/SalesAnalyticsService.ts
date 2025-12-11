import apiClient from "./ApiClient";

export const getDailySalesSummary = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/sales/daily");
        console.log("Daily sales summary fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Fetching daily sales summary failed:", error);
        throw error;
    }
};

export const getWeeklySalesSummary = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/sales/weekly");
        console.log("Weekly sales summary fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Fetching weekly sales summary failed:", error);
        throw error;
    }
};

export const getMonthlySalesSummary = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/sales/monthly");
        console.log("Monthly sales summary fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Fetching monthly sales summary failed:", error);
        throw error;
    }
};

export const getCustomSalesSummary = async (startDate: string, endDate: string) => {
    try {
        const response = await apiClient.get("/admin/analytics/sales/custom", {
            params: { startDate, endDate }
        });
        return response.data;
    } catch (error) {
        console.error("Fetching custom sales summary failed:", error);
        throw error;
    }
};
