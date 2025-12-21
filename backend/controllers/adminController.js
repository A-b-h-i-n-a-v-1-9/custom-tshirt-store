// controllers/adminController.js

const db = require("../config/db");

const getUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    console.error("🔥 Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const [orders] = await db.promise().query("SELECT * FROM orders");
    res.json(orders);
  } catch (error) {
    console.error("🔥 Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPayments = async (req, res) => {
  try {
    const [payments] = await db.promise().query("SELECT * FROM payments");
    res.json(payments);
  } catch (error) {
    console.error("🔥 Error fetching payments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const {
      category,
      color,
      size,
      fabric,
      material,
      capacity_ml,
      year,
      state,
      city,
      top_limit = 5,
      time_period = "month",
    } = req.query;

    // Basic counts (unfiltered)
    const [[{ totalUsers }]] = await db
      .promise()
      .query("SELECT COUNT(*) AS totalUsers FROM users");

    // Orders count with potential location filter
    let ordersCountQuery =
      "SELECT COUNT(*) AS totalOrders FROM orders WHERE 1=1";
    const ordersCountParams = [];

    if (state) {
      ordersCountQuery +=
        " AND address IN (SELECT id FROM user_addresses WHERE state = ?)";
      ordersCountParams.push(state);
    }
    if (city) {
      ordersCountQuery +=
        " AND address IN (SELECT id FROM user_addresses WHERE city = ?)";
      ordersCountParams.push(city);
    }

    const [[{ totalOrders }]] = await db
      .promise()
      .query(ordersCountQuery, ordersCountParams);

    // Total sales with filters
    let totalSalesQuery = `
SELECT COALESCE(SUM(total_price), 0) AS totalSales 
FROM orders 
WHERE status = 'delivered'
`;
    const totalSalesParams = [];

    if (state) {
      totalSalesQuery +=
        " AND address IN (SELECT id FROM user_addresses WHERE state = ?)";
      totalSalesParams.push(state);
    }
    if (city) {
      totalSalesQuery +=
        " AND address IN (SELECT id FROM user_addresses WHERE city = ?)";
      totalSalesParams.push(city);
    }

    const [[{ totalSales }]] = await db
      .promise()
      .query(totalSalesQuery, totalSalesParams);

    // 📦 Product Stats (with filters)
    let productQuery = `
SELECT p.category, p.name, COUNT(oi.id) as totalSold, 
       SUM(oi.quantity) as quantitySold, 
       SUM(oi.quantity * p.price) as revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
`;

    const queryParams = [];

    if (category === "t_shirt") {
      productQuery += " INNER JOIN t_shirts ts ON p.id = ts.product_id";
    } else if (category === "mug") {
      productQuery += " INNER JOIN mugs m ON p.id = m.product_id";
    } else if (category === "bottle") {
      productQuery += " INNER JOIN bottles b ON p.id = b.product_id";
    }

    productQuery += " WHERE o.status = 'delivered'";

    if (state) {
      productQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE state = ?)";
      queryParams.push(state);
    }
    if (city) {
      productQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE city = ?)";
      queryParams.push(city);
    }

    if (category) {
      productQuery += " AND p.category = ?";
      queryParams.push(category);
    }

    if (category === "t_shirt") {
      if (color) {
        productQuery += " AND ts.color = ?";
        queryParams.push(color);
      }
      if (size) {
        productQuery += " AND ts.size = ?";
        queryParams.push(size);
      }
      if (fabric) {
        productQuery += " AND ts.fabric = ?";
        queryParams.push(fabric);
      }
    } else if (category === "mug") {
      if (material) {
        productQuery += " AND m.material = ?";
        queryParams.push(material);
      }
    } else if (category === "bottle") {
      if (material) {
        productQuery += " AND b.material = ?";
        queryParams.push(material);
      }
      if (capacity_ml) {
        productQuery += " AND b.capacity_ml = ?";
        queryParams.push(capacity_ml);
      }
    }

    productQuery += " GROUP BY p.id ORDER BY revenue DESC";
    const [productStats] = await db.promise().query(productQuery, queryParams);

    // 1️⃣ TOP PRODUCTS CHART (with dynamic limit)
    let topProductsQuery = `
SELECT p.name, SUM(oi.quantity) as quantitySold 
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
LEFT JOIN t_shirts ts ON p.id = ts.product_id
LEFT JOIN mugs m ON p.id = m.product_id
LEFT JOIN bottles b ON p.id = b.product_id
WHERE o.status = 'delivered'
`;
    const topProductParams = [];

    if (state) {
      topProductsQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE state = ?)";
      topProductParams.push(state);
    }
    if (city) {
      topProductsQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE city = ?)";
      topProductParams.push(city);
    }
    if (category) {
      topProductsQuery += " AND p.category = ?";
      topProductParams.push(category);
    }
    if (category === "t_shirt") {
      if (color) {
        topProductsQuery += " AND ts.color = ?";
        topProductParams.push(color);
      }
      if (size) {
        topProductsQuery += " AND ts.size = ?";
        topProductParams.push(size);
      }
      if (fabric) {
        topProductsQuery += " AND ts.fabric = ?";
        topProductParams.push(fabric);
      }
    } else if (category === "mug") {
      if (material) {
        topProductsQuery += " AND m.material = ?";
        topProductParams.push(material);
      }
    } else if (category === "bottle") {
      if (material) {
        topProductsQuery += " AND b.material = ?";
        topProductParams.push(material);
      }
      if (capacity_ml) {
        topProductsQuery += " AND b.capacity_ml = ?";
        topProductParams.push(capacity_ml);
      }
    }

    topProductsQuery += " GROUP BY p.id ORDER BY quantitySold DESC LIMIT ?";
    topProductParams.push(parseInt(top_limit));
    const [topProducts] = await db
      .promise()
      .query(topProductsQuery, topProductParams);

    // 2️⃣ TOP LOCATIONS CHART (new)
    let topLocationsQuery = `
SELECT 
  ua.city,
  ua.state,
  SUM(o.total_price) as totalRevenue,
  COUNT(o.id) as orderCount
FROM orders o
JOIN user_addresses ua ON o.address = ua.id
WHERE o.status = 'delivered'
`;
    const topLocationsParams = [];

    if (state) {
      topLocationsQuery += " AND ua.state = ?";
      topLocationsParams.push(state);
    }
    if (city) {
      topLocationsQuery += " AND ua.city = ?";
      topLocationsParams.push(city);
    }

    topLocationsQuery +=
      " GROUP BY ua.city, ua.state ORDER BY totalRevenue DESC LIMIT ?";
    topLocationsParams.push(parseInt(top_limit));
    const [topLocations] = await db
      .promise()
      .query(topLocationsQuery, topLocationsParams);

    // 3️⃣ TOP TIME PERIODS CHART (new)
// In the topTimeQuery section, replace the monthly query with this:
const topTimeQuery =
  time_period === "year"
    ? `
SELECT 
  YEAR(created_at) as period,
  SUM(total_price) as totalRevenue,
  COUNT(id) as orderCount
FROM orders
WHERE status = 'delivered'
${
  state ? " AND address IN (SELECT id FROM user_addresses WHERE state = ?)" : ""
}
${city ? " AND address IN (SELECT id FROM user_addresses WHERE city = ?)" : ""}
GROUP BY YEAR(created_at)
ORDER BY totalRevenue DESC
LIMIT ?
`
    : `
SELECT 
  CONCAT(YEAR(created_at), '-', LPAD(MONTH(created_at), 2, '0')) as period,
  SUM(total_price) as totalRevenue,
  COUNT(id) as orderCount
FROM orders
WHERE status = 'delivered'
${
  state ? " AND address IN (SELECT id FROM user_addresses WHERE state = ?)" : ""
}
${city ? " AND address IN (SELECT id FROM user_addresses WHERE city = ?)" : ""}
GROUP BY YEAR(created_at), MONTH(created_at), period
ORDER BY totalRevenue DESC
LIMIT ?
`;

    const topTimeParams = [];
    if (state) topTimeParams.push(state);
    if (city) topTimeParams.push(city);
    topTimeParams.push(parseInt(top_limit));

    const [topTimePeriods] = await db
      .promise()
      .query(topTimeQuery, topTimeParams);

    // 📈 Order Trends (Last 7 Days with filters)
    let orderTrendsQuery = `
            SELECT DATE(o.created_at) as date, COUNT(*) as orders 
            FROM orders o
            WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `;
    const orderTrendsParams = [];

    if (state) {
      orderTrendsQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE state = ?)";
      orderTrendsParams.push(state);
    }
    if (city) {
      orderTrendsQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE city = ?)";
      orderTrendsParams.push(city);
    }

    orderTrendsQuery += " GROUP BY DATE(o.created_at) ORDER BY date ASC";
    const [orderTrends] = await db
      .promise()
      .query(orderTrendsQuery, orderTrendsParams);

    // 💳 Payment Stats (with filters)
    let paymentStatsQuery = `
            SELECT p.payment_method, COUNT(*) as count 
            FROM payments p
            JOIN orders o ON p.order_id = o.id
            WHERE 1=1
        `;
    const paymentStatsParams = [];

    if (state) {
      paymentStatsQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE state = ?)";
      paymentStatsParams.push(state);
    }
    if (city) {
      paymentStatsQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE city = ?)";
      paymentStatsParams.push(city);
    }

    paymentStatsQuery += " GROUP BY p.payment_method";
    const [paymentStats] = await db
      .promise()
      .query(paymentStatsQuery, paymentStatsParams);

    // 📆 Yearly Sales (with filters)
    let yearlySalesQuery = `
            SELECT YEAR(o.created_at) AS year, COUNT(*) AS totalOrders, SUM(o.total_price) AS totalSales
            FROM orders o
            WHERE o.status = 'delivered'
        `;
    const yearlySalesParams = [];

    if (state) {
      yearlySalesQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE state = ?)";
      yearlySalesParams.push(state);
    }
    if (city) {
      yearlySalesQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE city = ?)";
      yearlySalesParams.push(city);
    }

    yearlySalesQuery += " GROUP BY year ORDER BY year";
    const [yearlySales] = await db
      .promise()
      .query(yearlySalesQuery, yearlySalesParams);

    // 📆 Monthly Sales (with filters)
    const currentYear = new Date().getFullYear();
    const selectedYear = year || currentYear;

    let monthlySalesQuery = `
            SELECT MONTH(o.created_at) AS month, COUNT(*) AS totalOrders, SUM(o.total_price) AS totalSales
            FROM orders o
            WHERE o.status = 'delivered' AND YEAR(o.created_at) = ?
        `;
    const monthlySalesParams = [selectedYear];

    if (state) {
      monthlySalesQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE state = ?)";
      monthlySalesParams.push(state);
    }
    if (city) {
      monthlySalesQuery +=
        " AND o.address IN (SELECT id FROM user_addresses WHERE city = ?)";
      monthlySalesParams.push(city);
    }

    monthlySalesQuery += " GROUP BY month ORDER BY month";
    const [monthlySales] = await db
      .promise()
      .query(monthlySalesQuery, monthlySalesParams);

    // 🗺️ Location-wise Sales (with filters)
    let locationSalesQuery = `
            SELECT 
              ua.city,
              ua.state,
              COUNT(o.id) AS totalOrders, 
              SUM(o.total_price) AS totalSales
            FROM orders o
            JOIN user_addresses ua ON o.address = ua.id
            WHERE o.status = 'delivered'
        `;
    const locationSalesParams = [];

    if (state) {
      locationSalesQuery += " AND ua.state = ?";
      locationSalesParams.push(state);
    }
    if (city) {
      locationSalesQuery += " AND ua.city = ?";
      locationSalesParams.push(city);
    }

    locationSalesQuery +=
      " GROUP BY ua.city, ua.state ORDER BY totalSales DESC";
    const [locationSales] = await db
      .promise()
      .query(locationSalesQuery, locationSalesParams);

    // 🚀 Respond with all stats
    res.json({
      totalUsers: totalUsers || 0,
      totalOrders: totalOrders || 0,
      totalSales: totalSales || 0,
      productStats,
      topProducts, // Top selling products (with dynamic limit)
      topLocations, // Top revenue locations (new)
      topTimePeriods, // Top revenue time periods (new)
      orderTrends,
      paymentStats,
      yearlySales,
      monthlySales,
      locationSales,
    });
  } catch (error) {
    console.error("🔥 Error fetching admin stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getUsers,
  getOrders,
  getPayments,
  getAdminStats,
};
