const db = require('../config/db');

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
        // ✅ Total Users
        const [users] = await db.promise().query("SELECT COUNT(*) AS totalUsers FROM users");

        // ✅ Total Orders
        const [orders] = await db.promise().query("SELECT COUNT(*) AS totalOrders FROM orders");

        // ✅ Total Sales Revenue (Only delivered orders)
        const [sales] = await db.promise().query("SELECT SUM(total_price) AS totalSales FROM orders WHERE status = 'delivered'");

        // ✅ Product Sales Breakdown
        const [productStats] = await db.promise().query(`
            SELECT p.category, p.name, COUNT(oi.id) as totalSold, 
                   SUM(oi.quantity) as quantitySold, SUM(oi.quantity * p.price) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id
            ORDER BY revenue DESC
        `);

        // ✅ Top 5 Selling Products
        const [topProducts] = await db.promise().query(`
            SELECT p.name, SUM(oi.quantity) as quantitySold 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id
            ORDER BY quantitySold DESC
            LIMIT 5
        `);

        // ✅ Order Trends (Last 7 days)
        const [orderTrends] = await db.promise().query(`
            SELECT DATE(created_at) as date, COUNT(*) as orders 
            FROM orders 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // ✅ Payment Method Breakdown (Fixed)
        const [paymentStats] = await db.promise().query(`
            SELECT p.payment_method, COUNT(*) as count 
            FROM payments p
            JOIN orders o ON p.order_id = o.id
            GROUP BY p.payment_method
        `);

        res.json({
            totalUsers: users[0].totalUsers,
            totalOrders: orders[0].totalOrders,
            totalSales: sales[0].totalSales || 0,
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
