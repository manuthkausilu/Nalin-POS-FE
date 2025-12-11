import apiClient from "./ApiClient";

export interface DashboardStatsResponse {
    statusCode: number;
    message: string;
    data?: {
        monthlySalesCount: number;
        todaySalesCount: number;
    };
}

//implemented

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
    try {
        const response = await apiClient.get('/dashboard/stats');
        return response.data;
    } catch (error: any) {
        return {
            statusCode: error.response?.status || 500,
            message: error.response?.data?.message || 'Error fetching dashboard stats'
        };
    }
}

export interface AdminDashboardStatsResponse {
    statusCode: number;
    message: string;
    data?: {
        todayRevenue: [number, number];
        monthlyRevenue: [number, number];
        monthlySalesCount: number;
        todaySalesCount: number;
        totalProducts: number;
        activeProducts: number;
    };
}

//implemented
export const getAdminDashboardStats = async (): Promise<AdminDashboardStatsResponse> => {
    try {
        const response = await apiClient.get('/admin/dashboard/stats');
        return response.data;
    } catch (error: any) {
        return {
            statusCode: error.response?.status || 500,
            message: error.response?.data?.message || 'Error fetching admin dashboard stats'
        };
    }
};

export interface AdminDailySalesChartItem {
    date: string;
    salesCount: number;
}

export interface AdminDailySalesChartResponse {
    statusCode: number;
    message: string;
    data?: AdminDailySalesChartItem[];
}


//to be implemented
export const getAdminDailySalesChart = async (): Promise<AdminDailySalesChartResponse> => {
    try {
        const response = await apiClient.get('/admin/dashboard/daily-sales-chart');
        return response.data;
    } catch (error: any) {
        return {
            statusCode: error.response?.status || 500,
            message: error.response?.data?.message || 'Error fetching admin daily sales chart'
        };
    }
};

export interface AdminMonthlySalesChartItem {
    salesCount: number;
    month: string;
}

export interface AdminMonthlySalesChartResponse {
    statusCode: number;
    message: string;
    data?: AdminMonthlySalesChartItem[];
}

//implemented

export const getAdminMonthlySalesChart = async (): Promise<AdminMonthlySalesChartResponse> => {
    try {
        const response = await apiClient.get('/admin/dashboard/monthly-sales-chart');
        return response.data;
    } catch (error: any) {
        return {
            statusCode: error.response?.status || 500,
            message: error.response?.data?.message || 'Error fetching admin monthly sales chart'
        };
    }
};

export interface TodayRevenueAndProfitResponse {
    statusCode: number;
    message: string;
    data?: {
        revenue: number;
        transactions: number;
        profit: number;
    };
}


//to be implemented
export const getTodayRevenueAndProfit = async (): Promise<TodayRevenueAndProfitResponse> => {
    try {
        const response = await apiClient.get('/admin/analytics/revenue/today');
        return response.data;
    } catch (error: any) {
        return {
            statusCode: error.response?.status || 500,
            message: error.response?.data?.message || "Error fetching today's revenue and profit"
        };
    }
};

export interface MonthlyDailyRevenueStat {
    date: string;
    revenue: number;
    count: number;
    profit: number;
}

 export interface MonthlyDailyRevenueStatsResponse {
    statusCode: number;
    message: string;
    data?: {
        dailyStats: MonthlyDailyRevenueStat[];
    };
}

//implemented

export const getMonthlyDailyRevenueStats = async (): Promise<MonthlyDailyRevenueStatsResponse> => {
    try {
        const response = await apiClient.get('/admin/analytics/revenue/month/daily');
        return response.data;
    } catch (error: any) {
        return {
            statusCode: error.response?.status || 500,
            message: error.response?.data?.message || "Error fetching monthly daily revenue stats"
        };
    }
};

export interface YearlyMonthlyRevenueStat {
    revenue: number;
    month: number;
    count: number;
    profit: number;
}

export interface YearlyMonthlyRevenueStatsResponse {
    statusCode: number;
    message: string;
    data?: {
        monthlyStats: YearlyMonthlyRevenueStat[];
    };
}

//implemented
export const getYearlyMonthlyRevenueStats = async (): Promise<YearlyMonthlyRevenueStatsResponse> => {
    try {
        const response = await apiClient.get('/admin/analytics/revenue/year/monthly');
        return response.data;
    } catch (error: any) {
        return {
            statusCode: error.response?.status || 500,
            message: error.response?.data?.message || "Error fetching yearly monthly revenue stats"
        };
    }
};

