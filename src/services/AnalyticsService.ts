import apiClient from "./ApiClient";

export const getOverview = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/overview");
        return response.data;
    } catch (error) {
        console.error("Fetching overview failed:", error);
        throw error;
    }
};

export const getTopProducts = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/top-products");
        return response.data;
    } catch (error) {
        console.error("Fetching top products failed:", error);
        throw error;
    }
};

export const getInventoryStatus = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/inventory-status");
        return response.data;
    } catch (error) {
        console.error("Fetching inventory status failed:", error);
        throw error;
    }
};

export const getCustomerStats = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/customer-stats");
        return response.data;
    } catch (error) {
        console.error("Fetching customer stats failed:", error);
        throw error;
    }
};

export const getSalesSummaryByPeriod = async (
    period: string,
    startDate?: string,
    endDate?: string
) => {
    try {
        let params: any = {};
        if (period === "custom" && startDate && endDate) {
            params.startDate = startDate;
            params.endDate = endDate;
        }
        const response = await apiClient.get(`/admin/analytics/sales/${period}`, {
            params: params
        });
        return response.data;
    } catch (error) {
        console.error("Fetching sales summary by period failed:", error);
        throw error;
    }
};
