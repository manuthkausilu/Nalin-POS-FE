import apiClient from "./ApiClient";

export const getDailyProfitSummary = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/profit/daily");
        return response.data;
    } catch (error) {
        console.error("Fetching daily profit summary failed:", error);
        throw error;
    }
};

export const getWeeklyProfitSummary = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/profit/weekly");
        return response.data;
    } catch (error) {
        console.error("Fetching weekly profit summary failed:", error);
        throw error;
    }
};

export const getMonthlyProfitSummary = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/profit/monthly");
        return response.data;
    } catch (error) {
        console.error("Fetching monthly profit summary failed:", error);
        throw error;
    }
};

export const getCustomProfitSummary = async (startDate: string, endDate: string) => {
    try {
        const response = await apiClient.get("/admin/analytics/profit/custom", {
            params: { startDate, endDate }
        });
        return response.data;
    } catch (error) {
        console.error("Fetching custom profit summary failed:", error);
        throw error;
    }
};
