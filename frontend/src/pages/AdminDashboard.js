import { useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [fabric, setFabric] = useState("");
  const [material, setMaterial] = useState("");
  const [capacity, setCapacity] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
        params: { category, color, size, fabric, material, capacity_ml: capacity },
      });
      setStats(response.data);
    } catch (err) {
      console.error("🔥 Error fetching admin stats:", err);
      setError(err.response?.data?.error || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const orderTrendsData = {
    labels: stats?.productStats?.map((item) => item.name) || [],
    datasets: [
      {
        label: "Units Sold",
        data: stats?.productStats?.map((item) => item.quantitySold) || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const paymentStatsData = {
    labels: stats?.paymentStats?.map((item) => item.payment_method) || [],
    datasets: [
      {
        label: "Payment Methods",
        data: stats?.paymentStats?.map((item) => item.count) || [],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setMaterial("");
            setCapacity("");
            setSize("");
            setColor("");
            setFabric("");
          }}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          <option value="T-shirts">T-shirts</option>
          <option value="Mugs">Mugs</option>
          <option value="Bottles">Bottles</option>
        </select>

        {/* T-shirt Filters */}
        {category === "T-shirts" && (
          <>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Sizes</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>

            <input
              type="text"
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="p-2 border rounded"
            />

            <input
              type="text"
              placeholder="Fabric"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="p-2 border rounded"
            />
          </>
        )}

        {/* Mugs & Bottles Filters */}
        {category === "Mugs" || category === "Bottles" ? (
          <>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Materials</option>
              {category === "Mugs" && (
                <>
                  <option value="ceramic">Ceramic</option>
                  <option value="glass">Glass</option>
                  <option value="plastic">Plastic</option>
                </>
              )}
              {category === "Bottles" && (
                <>
                  <option value="stainless_steel">Stainless Steel</option>
                  <option value="plastic">Plastic</option>
                  <option value="glass">Glass</option>
                </>
              )}
            </select>
            <input
              type="number"
              placeholder="Capacity (ml)"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="p-2 border rounded"
            />
          </>
        ) : null}

        {/* Fetch Stats Button */}
        <button
          onClick={fetchStats}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Fetch Stats
        </button>
      </div>

      {loading && <p className="text-center text-lg font-semibold">Loading Dashboard...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-blue-500 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Total Orders</h2>
            <p className="text-3xl font-bold">{stats.totalOrders || 0}</p>
          </div>
          <div className="p-4 bg-green-500 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Total Revenue</h2>
            <p className="text-3xl font-bold">₹{stats.totalSales || 0}</p>
          </div>
          <div className="p-4 bg-yellow-500 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Total Users</h2>
            <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {stats && (
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
      )}
    </div>
  );
};

export default AdminDashboard;
