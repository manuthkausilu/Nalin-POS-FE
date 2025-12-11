import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  getAdminDashboardStats,
  getMonthlyDailyRevenueStats,
  getYearlyMonthlyRevenueStats,
  getAdminMonthlySalesChart,
  type AdminDashboardStatsResponse,
  type MonthlyDailyRevenueStatsResponse,
  type YearlyMonthlyRevenueStatsResponse,
  type AdminMonthlySalesChartResponse,
} from '../../services/DashboardService';

const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStatsResponse['data']>();
  const [dailyStats, setDailyStats] = useState<MonthlyDailyRevenueStatsResponse['data']>();
  const [yearlyStats, setYearlyStats] = useState<YearlyMonthlyRevenueStatsResponse['data']>();
  const [monthlySalesChart, setMonthlySalesChart] = useState<AdminMonthlySalesChartResponse['data']>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, dailyRes, yearlyRes, monthlySalesRes] = await Promise.all([
          getAdminDashboardStats(),
          getMonthlyDailyRevenueStats(),
          getYearlyMonthlyRevenueStats(),
          getAdminMonthlySalesChart()
        ]);

        if (statsRes.statusCode === 200) setDashboardStats(statsRes.data);
        if (dailyRes.statusCode === 200) setDailyStats(dailyRes.data);
        if (yearlyRes.statusCode === 200) setYearlyStats(yearlyRes.data);
        if (monthlySalesRes.statusCode === 200) setMonthlySalesChart(monthlySalesRes.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const processDataForAllDays = (dailyStats?: MonthlyDailyRevenueStatsResponse['data']) => {
    if (!dailyStats?.dailyStats) return [];
    
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create array with all days of the month
    const allDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        date: dateStr,
        revenue: 0,
        profit: 0,
        count: 0
      };
    });

    // Merge existing data
    dailyStats.dailyStats.forEach(stat => {
      const dayIndex = new Date(stat.date).getDate() - 1;
      if (dayIndex >= 0 && dayIndex < allDays.length) {
        allDays[dayIndex] = stat;
      }
    });

    return allDays;
  };

  const processDataForAllMonths = (yearlyStats?: YearlyMonthlyRevenueStatsResponse['data']) => {
    if (!yearlyStats?.monthlyStats) return [];
    
    const months = Array.from({ length: 12 }, (_, i) => {
      return {
        month: i + 1,
        revenue: 0,
        profit: 0,
        count: 0
      };
    });

    yearlyStats.monthlyStats.forEach(stat => {
      if (stat.month >= 1 && stat.month <= 12) {
        months[stat.month - 1] = stat;
      }
    });

    return months;
  };

  const processMonthlyChartData = (data?: AdminMonthlySalesChartResponse['data']) => {
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
             'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'][i],
      salesCount: 0
    }));

    if (data) {
      data.forEach(item => {
        const monthIndex = allMonths.findIndex(m => m.month === item.month);
        if (monthIndex !== -1) {
          allMonths[monthIndex] = item;
        }
      });
    }

    return allMonths;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {loading && <div className="mb-4 text-gray-500">Loading...</div>}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">Today Sales</h3>
          <p className="text-2xl mt-2">{dashboardStats?.todaySalesCount ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">Monthly Sales</h3>
          <p className="text-2xl mt-2">{dashboardStats?.monthlySalesCount ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">Total Products</h3>
          <p className="text-2xl mt-2">{dashboardStats?.totalProducts ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">Active Products</h3>
          <p className="text-2xl mt-2">{dashboardStats?.activeProducts ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow w-full">
          <h2 className="text-lg font-semibold mb-4">Daily Revenue</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processDataForAllDays(dailyStats)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow w-full">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processDataForAllMonths(yearlyStats)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ][value - 1]}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ][label - 1]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#4F46E5" name="Revenue" />
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow w-full">
          <h2 className="text-lg font-semibold mb-4">Monthly Sales Count</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processMonthlyChartData(monthlySalesChart)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => value.substring(0, 3)}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="salesCount" 
                  fill="#8884d8" 
                  name="Sales Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
