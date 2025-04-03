const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// 📦 Place an order
router.post('/place', authMiddleware, async (req, res) => {
    const { cartItems, address, paymentMethod } = req.body;
    const user_id = req.user.id;

    console.log("📥 Received order request:", req.body); // 🟢 Log received data

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // 🔍 Get Product Prices
        const productIds = cartItems.map(item => item.product_id);
        const [products] = await connection.query(
            `SELECT id, price FROM products WHERE id IN (?)`,
            [productIds]
        );

        console.log("📦 Products Found in DB:", products);

        let totalPrice = 0;
        const validCartItems = [];

        cartItems.forEach(item => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                totalPrice += parseFloat(product.price) * item.quantity;
                validCartItems.push([item.product_id, item.quantity]);
            }
        });

        console.log("✅ Valid Cart Items:", validCartItems);

        if (validCartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: "No valid products found in cart." });
        }

        // 📝 Insert Order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_price, address) VALUES (?, ?, ?)`,
            [user_id, totalPrice, address]
        );

        const order_id = orderResult.insertId;
        const orderItemsValues = validCartItems.map(item => [order_id, ...item]);

        await connection.query(
            `INSERT INTO order_items (order_id, product_id, quantity) VALUES ?`,
            [orderItemsValues]
        );

        // 💰 Insert Payment Record
        if (["credit_card", "debit_card", "UPI", "PayPal", "COD"].includes(paymentMethod)) {
            await connection.query(
                `INSERT INTO payments (order_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)`,
                [order_id, totalPrice, paymentMethod, paymentMethod === "COD" ? "pending" : "completed"]
            );
        }

        await connection.commit();
        connection.release();

        res.json({ message: "✅ Order placed successfully!", order_id });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("🔥 Error placing order:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🛍 Get user orders
router.get('/', authMiddleware, async (req, res) => {
    const user_id = req.user.id;

    try {
        const [orders] = await db.promise().execute(
            `SELECT id, total_price, address, created_at FROM orders WHERE user_id = ?`,
            [user_id]
        );

        if (orders.length === 0) {
            return res.json([]);
        }

        const orderIds = orders.map(order => order.id);

        const [orderItems] = await db.promise().execute(
            `SELECT order_id, product_id, quantity FROM order_items WHERE order_id IN (?)`,
            [orderIds]
        );

        const ordersWithItems = orders.map(order => ({
            ...order,
            items: orderItems.filter(item => item.order_id === order.id)
        }));

        res.json(ordersWithItems);
    } catch (err) {
        console.error("🔥 Error fetching orders:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📊 Order Statistics (for Analytics & Graphs)
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // 🛍 Total Orders & Revenue
        const [orders] = await db.promise().execute(
            "SELECT COUNT(*) as totalOrders, SUM(total_price) as totalRevenue FROM orders"
        );

        // 🔢 Sales Data (Product-wise)
        const [orderItems] = await db.promise().execute(
            "SELECT product_id, SUM(quantity) as totalSold FROM order_items GROUP BY product_id"
        );

        // 💰 Payment Data
        const [payments] = await db.promise().execute(
            "SELECT COUNT(*) as totalPayments, SUM(amount) as totalAmount FROM payments WHERE payment_status='completed'"
        );

        res.json({
            totalOrders: orders[0].totalOrders || 0,
            totalRevenue: orders[0].totalRevenue || 0,
            totalPayments: payments[0].totalPayments || 0,
            totalAmount: payments[0].totalAmount || 0,
            sales: orderItems
        });

    } catch (err) {
        console.error("🔥 Error fetching stats:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
