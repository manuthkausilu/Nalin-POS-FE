import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/DashboardService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


type DashboardStats = {
  monthlySalesCount: number;
  todaySalesCount: number;
};

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await getDashboardStats();
        if (response.statusCode === 200 && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Prepare chart data based on available stats
  const orderData = [
    { day: 'Today', orders: stats?.todaySalesCount ?? 0 },
    { day: 'Month', orders: stats?.monthlySalesCount ?? 0 },
  ];

  const monthlyStats = [
    { month: 'Current', orders: stats?.monthlySalesCount ?? 0 },
    // Optionally add previous month if available in API
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Today's Orders</h3>
              <p className="text-2xl font-bold text-gray-800">{stats?.todaySalesCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Monthly Orders</h3>
              <p className="text-2xl font-bold text-gray-800">{stats?.monthlySalesCount}</p>
            </div>
            {/* You can add more cards if API provides more data */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Average Daily Orders</h3>
              <p className="text-2xl font-bold text-gray-800">
                {stats ? Math.round((stats.monthlySalesCount ?? 0) / (new Date().getDate())) : 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Pending Orders</h3>
              <p className="text-2xl font-bold text-gray-800">-</p>
              <span className="text-yellow-500 text-sm">N/A</span>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Order Trend</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#4F46E5" 
                      fill="rgba(79, 70, 229, 0.1)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Monthly Comparison</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="orders" 
                      fill="#4F46E5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;