import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [fabric, setFabric] = useState("");
  const [material, setMaterial] = useState("");
  const [capacity, setCapacity] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [locationFilters, setLocationFilters] = useState({
    state: "",
    city: "",
  });
  const [availableCities, setAvailableCities] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    image: "",
    price: "",
    description: "",
    category: "",
    size: "",
    fabric: "",
    gender: "",
    color: "",
    material: "",
    capacity: "",
    insulated: false,
    stock: "",
  });
  const [filters, setFilters] = useState({
    category: "",
    color: "",
    size: "",
    fabric: "",
    material: "",
    capacity_ml: "",
    year: new Date().getFullYear(),
    state: "",
    city: "",
    top_limit: 5, // Add this
    time_period: "month", // Add this
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        category,
        year: selectedYear,
        // Add location filters if they exist
        ...(locationFilters.state && { state: locationFilters.state }),
        ...(locationFilters.city && { city: locationFilters.city }),
      };

      // Add color filter if it exists (works across categories)
      if (color) params.color = color;

      // Category-specific filters
      if (category === "t_shirt") {
        if (size) params.size = size;
        if (fabric) params.fabric = fabric;
      } else if (category === "mugs") {
        if (material) params.material = material;
      } else if (category === "bottles") {
        if (material) params.material = material;
        if (capacity) params.capacity_ml = capacity;
      }

      // Clean up undefined params
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const response = await axios.get(
        "http://localhost:5000/api/admin/stats",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
          params,
        }
      );

      setStats(response.data);

      // Update available cities when new data comes in
      if (locationFilters.state && response.data?.locationSales) {
        const citiesForState = response.data.locationSales
          .filter((loc) => loc.state === locationFilters.state)
          .map((loc) => loc.city);
        setAvailableCities([...new Set(citiesForState)]);
      }
    } catch (err) {
      console.error("🔥 Error fetching admin stats:", err);
      setError(err.response?.data?.error || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, [
    category,
    color,
    size,
    fabric,
    material,
    capacity,
    selectedYear,
    locationFilters.state, // Add to dependencies
    locationFilters.city, // Add to dependencies
  ]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      setError("Error loading users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      setError("Error loading orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/payments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      setPayments(res.data);
    } catch (err) {
      setError("Error loading payments");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      setProducts(res.data);
    } catch (err) {
      setError("Error loading products");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddProduct = async () => {
    const requiredFields = [
      "name",
      "image",
      "price",
      "description",
      "category",
      "stock",
    ];
    for (const field of requiredFields) {
      if (!newProduct[field]) {
        alert(`Please fill in the ${field} field.`);
        return;
      }
    }

    if (newProduct.category === "t_shirt") {
      if (!newProduct.size || !newProduct.color) {
        alert("Please enter both size and color for the T-shirt.");
        return;
      }
    } else if (newProduct.category === "mugs") {
      if (!newProduct.material || !newProduct.capacity) {
        alert("Please enter both material and capacity for the mug.");
        return;
      }
    } else if (newProduct.category === "bottles") {
      if (!newProduct.material || !newProduct.capacity) {
        alert("Please enter both material and capacity for the bottle.");
        return;
      }
    }

    const payload = {
      name: newProduct.name,
      image: newProduct.image,
      price: newProduct.price,
      description: newProduct.description,
      category: newProduct.category,
      stock: newProduct.stock,
      extraDetails: {},
    };

    if (newProduct.category === "t_shirt") {
      payload.extraDetails = {
        size: newProduct.size,
        fabric: newProduct.fabric,
        gender: newProduct.gender,
        color: newProduct.color,
      };
    } else if (newProduct.category === "mugs") {
      payload.extraDetails = {
        material: newProduct.material,
        capacity: newProduct.capacity,
        color: newProduct.color,
      };
    } else if (newProduct.category === "bottles") {
      payload.extraDetails = {
        material: newProduct.material,
        capacity: newProduct.capacity,
        insulated: newProduct.insulated,
      };
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products/add",
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );

      setNewProduct({
        name: "",
        image: "",
        price: "",
        description: "",
        category: "",
        size: "",
        fabric: "",
        gender: "",
        color: "",
        material: "",
        capacity: "",
        insulated: false,
        stock: "",
      });
      fetchProducts();
    } catch (error) {
      console.error(
        "❌ Error adding product:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete(`http://localhost:5000/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  useEffect(() => {
    if (activePage === "dashboard") fetchStats();
    if (activePage === "users") fetchUsers();
    if (activePage === "orders") fetchOrders();
    if (activePage === "payments") fetchPayments();
    if (activePage === "products") fetchProducts();
  }, [
    activePage,
    fetchStats,
    fetchUsers,
    fetchOrders,
    fetchPayments,
    fetchProducts,
  ]);

  // Chart data configurations
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

  const yearlySalesData = {
    labels: stats?.yearlySales?.map((item) => item.year) || [],
    datasets: [
      {
        label: "Yearly Revenue",
        data: stats?.yearlySales?.map((item) => item.totalSales) || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const monthlySalesData = {
    labels:
      stats?.monthlySales?.map((item) => {
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return monthNames[item.month - 1];
      }) || [],
    datasets: [
      {
        label: "Monthly Revenue",
        data: stats?.monthlySales?.map((item) => item.totalSales) || [],
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const locationSalesData = {
    labels: stats?.locationSales
      ?.filter(
        (loc) =>
          (!locationFilters.state || loc.state === locationFilters.state) &&
          (!locationFilters.city || loc.city === locationFilters.city)
      )
      .map((loc) => `${loc.city}, ${loc.state}`) || ["No data"],

    datasets: [
      {
        label: "Revenue by Location",
        data: stats?.locationSales
          ?.filter(
            (loc) =>
              (!locationFilters.state || loc.state === locationFilters.state) &&
              (!locationFilters.city || loc.city === locationFilters.city)
          )
          .map((loc) => parseFloat(loc.totalSales)) || [0],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex min-h-screen">
      {/* Sticky Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-2">
          <li
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              activePage === "dashboard"
                ? "bg-gray-700 font-medium"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              activePage === "users"
                ? "bg-gray-700 font-medium"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActivePage("users")}
          >
            Users
          </li>
          <li
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              activePage === "orders"
                ? "bg-gray-700 font-medium"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActivePage("orders")}
          >
            Orders
          </li>
          <li
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              activePage === "payments"
                ? "bg-gray-700 font-medium"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActivePage("payments")}
          >
            Payments
          </li>
          <li
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              activePage === "products"
                ? "bg-gray-700 font-medium"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActivePage("products")}
          >
            Products
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Admin {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </h1>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {activePage === "dashboard" && stats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Orders
                    </p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {stats.totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-semibold text-gray-800">
                      ₹{stats.totalSales}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Users
                    </p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {stats.totalUsers}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Filters Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Filters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="t_shirt">T-shirt</option>
                    <option value="mugs">Mug</option>
                    <option value="bottles">Bottle</option>
                  </select>
                </div>

                {category === "t_shirt" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size
                      </label>
                      <input
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Size"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fabric
                      </label>
                      <input
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Fabric"
                        value={fabric}
                        onChange={(e) => setFabric(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {category === "mugs" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Material"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </div>
                )}

                {category === "bottles" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <input
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Material"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity (ml)
                      </label>
                      <input
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={fetchStats}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Product Sales
                </h2>
                <Bar
                  data={orderTrendsData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Payment Methods
                </h2>
                <Pie
                  data={paymentStatsData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Year Selection */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <label
                htmlFor="year-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Year:
              </label>
              <select
                id="year-select"
                className="w-32 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {stats?.yearlySales?.map((yearData) => (
                  <option key={yearData.year} value={yearData.year}>
                    {yearData.year}
                  </option>
                ))}
              </select>
            </div>

            {/* New Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Yearly Sales Trend
                </h2>
                <Line
                  data={yearlySalesData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Monthly Sales ({selectedYear})
                </h2>
                <Line
                  data={monthlySalesData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
            {/* Location Filter */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h3 className="text-lg font-medium mb-3 text-gray-700">
                Location Filter
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* State Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/UT
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={locationFilters.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setLocationFilters({
                        state: newState,
                        city: "", // Reset city when state changes
                      });
                      // Update available cities
                      if (stats?.locationSales) {
                        const citiesForState = stats.locationSales
                          .filter((loc) => loc.state === newState)
                          .map((loc) => loc.city);
                        setAvailableCities([...new Set(citiesForState)]);
                      }
                    }}
                  >
                    <option value="">All States</option>
                    {stats?.locationSales &&
                      [
                        ...new Set(stats.locationSales.map((loc) => loc.state)),
                      ].map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                  </select>
                </div>

                {/* City Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={locationFilters.city}
                    onChange={(e) =>
                      setLocationFilters({
                        ...locationFilters,
                        city: e.target.value,
                      })
                    }
                    disabled={!locationFilters.state}
                  >
                    <option value="">All Cities</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Apply Button */}
                <div className="flex items-end">
                  <button
                    onClick={() =>
                      fetchStats({
                        ...(locationFilters.state && {
                          state: locationFilters.state,
                        }),
                        ...(locationFilters.city && {
                          city: locationFilters.city,
                        }),
                      })
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  >
                    Apply Location Filter
                  </button>
                </div>
              </div>
            </div>
            {/* Location Sales */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Location-wise Sales
              </h2>
              <div className="h-96">
                <Bar
                  data={locationSalesData}
                  options={{
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
            {/* Update the charts section with better visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Products Chart - Updated */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Top Selling Products
                </h2>
                <Bar
                  data={{
                    labels: stats.topProducts?.map((p) => p.name) || [],
                    datasets: [
                      {
                        label: "Units Sold",
                        data:
                          stats.topProducts?.map((p) => p.quantitySold) || [],
                        backgroundColor: "rgba(59, 130, 246, 0.7)",
                        borderColor: "rgba(59, 130, 246, 1)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.raw} units sold`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Units Sold",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            {/* Update the charts section with better visualization */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
  {/* Top Revenue Locations Chart - Updated */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Top Revenue Locations
      </h2>
      <select
        className="text-sm p-2 border border-gray-300 rounded-md"
        value={filters.top_limit}
        onChange={(e) =>
          setFilters({ ...filters, top_limit: e.target.value })
        }
      >
        <option value="5">Top 5</option>
        <option value="10">Top 10</option>
        <option value="15">Top 15</option>
      </select>
    </div>

    {stats?.topLocations?.length > 0 ? (
      <Bar
        data={{
          labels: stats.topLocations.map(
            (loc) => `${loc.city}, ${loc.state}`
          ),
          datasets: [
            {
              label: "Revenue (₹)",
              data: stats.topLocations.map((loc) => loc.totalRevenue),
              backgroundColor: "rgba(79, 70, 229, 0.7)",
              borderColor: "rgba(79, 70, 229, 1)",
              borderWidth: 1,
            },
          ],
        }}
        options={{
          indexAxis: "y",
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const location = stats.topLocations[context.dataIndex];
                  return [
                    `Revenue: ₹${location.totalRevenue.toLocaleString()}`,
                    `Orders: ${location.orderCount}`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Revenue (₹)",
              },
              ticks: {
                callback: (value) => `₹${value.toLocaleString()}`,
              },
            },
          },
        }}
      />
    ) : (
      <div className="text-center py-8 text-gray-500">
        No location data available
      </div>
    )}
  </div>

  {/* Top Revenue Periods Chart - Updated */}
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Top Revenue Periods
      </h2>
      <div className="flex space-x-2">
        <select
          className="text-sm p-2 border border-gray-300 rounded-md"
          value={filters.time_period}
          onChange={(e) =>
            setFilters({ ...filters, time_period: e.target.value })
          }
        >
          <option value="month">By Month</option>
          <option value="year">By Year</option>
        </select>
        <select
          className="text-sm p-2 border border-gray-300 rounded-md"
          value={filters.top_limit}
          onChange={(e) =>
            setFilters({ ...filters, top_limit: e.target.value })
          }
        >
          <option value="5">Top 5</option>
          <option value="10">Top 10</option>
          <option value="15">Top 15</option>
        </select>
      </div>
    </div>

    {stats?.topTimePeriods?.length > 0 ? (
      <Bar
        data={{
          labels: stats.topTimePeriods.map((period) =>
            filters.time_period === "year"
              ? period.period
              : `${
                  monthNames[
                    parseInt(period.period.split("-")[1]) - 1
                  ]
                } ${period.period.split("-")[0]}`
          ),
          datasets: [
            {
              label: "Revenue (₹)",
              data: stats.topTimePeriods.map(
                (period) => period.totalRevenue
              ),
              backgroundColor: "rgba(16, 185, 129, 0.7)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const period = stats.topTimePeriods[context.dataIndex];
                  return [
                    `Revenue: ₹${period.totalRevenue.toLocaleString()}`,
                    `Orders: ${period.orderCount}`,
                  ];
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Revenue (₹)",
              },
              ticks: {
                callback: (value) => `₹${value.toLocaleString()}`,
              },
            },
          },
        }}
      />
    ) : (
      <div className="text-center py-8 text-gray-500">
        No time period data available
      </div>
    )}
  </div>
</div>
          </>
        )}

        {activePage === "users" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                User Management
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activePage === "orders" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Order Management
              </h2>
              <div className="flex space-x-2">
                <select
                  className="p-2 border border-gray-300 rounded-md text-sm"
                  onChange={(e) => {
                    // Add status filter functionality
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  className="p-2 border border-gray-300 rounded-md text-sm"
                  onChange={(e) => {
                    // Add date filter functionality
                  }}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{order.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className={`text-xs leading-5 font-semibold rounded-full px-3 py-1 ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                          value={order.status}
                          onChange={(e) => {
                            // Add status update functionality
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            // Add view details functionality
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            // Add print invoice functionality
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Add pagination if needed */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">10</span> of{" "}
                    <span className="font-medium">{orders.length}</span> results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === "payments" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Payment Records
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Payment ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Method
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.payment_method === "credit_card"
                              ? "bg-purple-100 text-purple-800"
                              : payment.payment_method === "paypal"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activePage === "products" && (
          <div>
            {/* Updated Add Product Form */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {products.length > 0
                    ? "Add New Product"
                    : "Create Your First Product"}
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name*
                    </label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Premium Cotton T-Shirt"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="t_shirt">T-shirt</option>
                      <option value="mugs">Mug</option>
                      <option value="bottles">Bottle</option>
                    </select>
                  </div>
                </div>

                {/* Image and Pricing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL*
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    name="image"
                    value={newProduct.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {newProduct.image && (
                    <div className="mt-2">
                      <img
                        src={newProduct.image}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)*
                    </label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock*
                    </label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      name="stock"
                      type="number"
                      min="0"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    name="description"
                    rows="3"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    placeholder="Describe the product features and benefits..."
                    required
                  />
                </div>

                {/* Category-specific fields */}
                {newProduct.category === "t_shirt" && (
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size*
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        name="size"
                        value={newProduct.size}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Size</option>
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color*
                      </label>
                      <input
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        name="color"
                        value={newProduct.color}
                        onChange={handleInputChange}
                        placeholder="e.g. Black, Navy"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fabric
                      </label>
                      <input
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        name="fabric"
                        value={newProduct.fabric}
                        onChange={handleInputChange}
                        placeholder="e.g. 100% Cotton"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        name="gender"
                        value={newProduct.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Unisex</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="md:col-span-2 flex justify-end space-x-4">
                  <button
                    onClick={() =>
                      setNewProduct({
                        name: "",
                        image: "",
                        price: "",
                        description: "",
                        category: "",
                        size: "",
                        fabric: "",
                        gender: "",
                        color: "",
                        material: "",
                        capacity: "",
                        insulated: false,
                        stock: "",
                      })
                    }
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  >
                    Clear Form
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      "Add Product"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Updated Product List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Product Inventory ({products.length})
                </h2>
                <div className="flex space-x-2">
                  <select
                    className="p-2 border border-gray-300 rounded-md text-sm"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="t_shirt">T-shirts</option>
                    <option value="mugs">Mugs</option>
                    <option value="bottles">Bottles</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="p-2 border border-gray-300 rounded-md text-sm"
                    onChange={(e) => {
                      // Add search functionality here
                    }}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded object-cover"
                                src={
                                  product.image ||
                                  "https://via.placeholder.com/100?text=No+Image"
                                }
                                alt={product.name}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/100?text=No+Image";
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              // Add edit functionality here
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
