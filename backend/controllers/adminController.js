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

// 🔥 Get Admin Dashboard Stats with Product Analytics
const getAdminStats = async (req, res) => {
    try {
        const { category, color, size, fabric, material, capacity_ml } = req.query; // Extract filters

        // ✅ Total Users
        const [[{ totalUsers }]] = await db.promise().query("SELECT COUNT(*) AS totalUsers FROM users");

        // ✅ Total Orders
        const [[{ totalOrders }]] = await db.promise().query("SELECT COUNT(*) AS totalOrders FROM orders");

        // ✅ Total Sales Revenue (Ensure NULL is treated as 0)
        const [[{ totalSales }]] = await db.promise().query("SELECT COALESCE(SUM(total_price), 0) AS totalSales FROM orders WHERE status = 'delivered'");

        // ✅ Product Sales Breakdown with Filters (Supports all categories)
        let productQuery = `
            SELECT p.category, p.name, COUNT(oi.id) as totalSold, 
                SUM(oi.quantity) as quantitySold, SUM(oi.quantity * p.price) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN t_shirts ts ON p.id = ts.product_id
            LEFT JOIN mugs m ON p.id = m.product_id
            LEFT JOIN bottles b ON p.id = b.product_id
            WHERE 1=1`;
        
        const queryParams = [];
        if (category) {
            productQuery += " AND (p.category = ? OR p.category = 't_shirt')";
            queryParams.push(category);
        }
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
        if (material) {
            productQuery += " AND (m.material = ? OR b.material = ?)";
            queryParams.push(material, material);
        }
        if (capacity_ml) {
            productQuery += " AND b.capacity_ml = ?";
            queryParams.push(capacity_ml);
        }

        productQuery += " GROUP BY p.id ORDER BY revenue DESC";
        const [productStats] = await db.promise().query(productQuery, queryParams);

        // ✅ Top 5 Selling Products
        let topProductsQuery = `
            SELECT p.name, SUM(oi.quantity) as quantitySold 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN t_shirts ts ON p.id = ts.product_id
            LEFT JOIN mugs m ON p.id = m.product_id
            LEFT JOIN bottles b ON p.id = b.product_id
            WHERE 1=1`;

        const topProductParams = [];
        if (category) {
            topProductsQuery += " AND (p.category = ? OR p.category = 't_shirt')";
            topProductParams.push(category);
        }
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
        if (material) {
            topProductsQuery += " AND (m.material = ? OR b.material = ?)";
            topProductParams.push(material, material);
        }
        if (capacity_ml) {
            topProductsQuery += " AND b.capacity_ml = ?";
            topProductParams.push(capacity_ml);
        }

        topProductsQuery += " GROUP BY p.id ORDER BY quantitySold DESC LIMIT 5";
        const [topProducts] = await db.promise().query(topProductsQuery, topProductParams);

        // ✅ Order Trends (Last 7 days)
        const [orderTrends] = await db.promise().query(`
            SELECT DATE(created_at) as date, COUNT(*) as orders 
            FROM orders 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // ✅ Payment Method Breakdown
        const [paymentStats] = await db.promise().query(`
            SELECT p.payment_method, COUNT(*) as count 
            FROM payments p
            JOIN orders o ON p.order_id = o.id
            GROUP BY p.payment_method
        `);

        res.json({
            totalUsers: totalUsers || 0,
            totalOrders: totalOrders || 0,
            totalSales: totalSales || 0,
            productStats,
            topProducts,
            orderTrends,
            paymentStats,
        });
    } catch (error) {
        console.error("🔥 Error fetching admin stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = { getUsers, getOrders, getPayments, getAdminStats };
