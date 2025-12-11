import apiClient    from "./ApiClient";


export const getStockOverview = async () => {
    try {
        const response = await apiClient.get("/admin/analytics/stock-overview");
        return response.data;
    } catch (error) {
        console.error("Error fetching stock overview:", error);
        throw error;
    }
}
