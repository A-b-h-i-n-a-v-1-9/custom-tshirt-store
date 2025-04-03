import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure valid token
          },
          withCredentials: true, // If using cookies for auth
        });
        setStats(response.data);
      } catch (err) {
        console.error("🔥 Error fetching admin stats:", err);
        setError(err.response?.data?.error || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="text-center text-lg font-semibold">Loading Dashboard...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  // 📊 Order Trends Data
  const orderTrendsData = {
    labels: stats.sales?.map((item) => `Product ${item.product_id}`) || [],
    datasets: [
      {
        label: "Units Sold",
        data: stats.sales?.map((item) => item.totalSold) || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // 💰 Payment Statistics Data
  const paymentStatsData = {
    labels: ["Total Payments", "Total Amount Collected"],
    datasets: [
      {
        label: "Payment Statistics",
        data: [stats.totalPayments || 0, stats.totalAmount || 0],
        backgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-3xl font-bold">{stats.totalOrders || 0}</p>
        </div>
        <div className="p-4 bg-green-500 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-3xl font-bold">₹{stats.totalRevenue || 0}</p>
        </div>
        <div className="p-4 bg-yellow-500 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Total Completed Payments</h2>
          <p className="text-3xl font-bold">{stats.totalPayments || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Product Sales</h2>
          <Bar data={orderTrendsData} />
        </div>

        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Payment Statistics</h2>
          <Pie data={paymentStatsData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
