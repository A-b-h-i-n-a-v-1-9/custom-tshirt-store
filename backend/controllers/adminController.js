const db = require('../config/db');

const getUsers = async (req, res) => {
    try {
        const [users] = await db.promise().query("SELECT * FROM users");
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getOrders = async (req, res) => {
    try {
        const [orders] = await db.promise().query("SELECT * FROM orders");
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getPayments = async (req, res) => {
    try {
        const [payments] = await db.promise().query("SELECT * FROM payments");
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const [users] = await db.promise().query("SELECT COUNT(*) AS totalUsers FROM users");
        const [orders] = await db.promise().query("SELECT COUNT(*) AS totalOrders FROM orders");
        const [sales] = await db.promise().query("SELECT SUM(total_price) AS totalSales FROM orders WHERE status = 'delivered'");

        res.json({
            totalUsers: users[0].totalUsers,
            totalOrders: orders[0].totalOrders,
            totalSales: sales[0].totalSales || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Make sure everything is properly exported
module.exports = { getUsers, getOrders, getPayments, getAdminStats };
