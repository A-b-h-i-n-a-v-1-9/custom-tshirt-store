const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const crypto = require('crypto'); // For secure transaction IDs
require('dotenv').config();

const router = express.Router();

// 🔹 Make a Payment
router.post('/', authMiddleware, async (req, res) => {
    const { order_id, payment_method } = req.body;
    const user_id = req.user.id;

    if (!order_id || !payment_method) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Step 1: Validate the order_id belongs to the user and isn't already paid
        const [order] = await db.promise().query(
            `SELECT id, total_price FROM orders WHERE id = ? AND user_id = ?`,
            [order_id, user_id]
        );

        if (order.length === 0) {
            return res.status(404).json({ error: "Order not found or does not belong to you" });
        }

        // Step 2: Check if payment already exists for this order
        const [existingPayment] = await db.promise().query(
            `SELECT id FROM payments WHERE order_id = ?`,
            [order_id]
        );

        if (existingPayment.length > 0) {
            return res.status(400).json({ error: "Payment already processed for this order" });
        }

        // Step 3: Generate a secure transaction ID
        const transactionId = `TXN-${crypto.randomBytes(4).toString('hex')}`;

        // Step 4: Insert payment record
        await db.promise().query(
            `INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, ?, ?)`,
            [order_id, order[0].total_price, payment_method, 'completed', transactionId]
        );

        res.json({ message: "Payment successful", transaction_id: transactionId });

    } catch (err) {
        console.error("🔥 Payment Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Get User Payments
router.get('/', authMiddleware, async (req, res) => {
    const user_id = req.user.id;

    try {
        const [payments] = await db.promise().query(
            `SELECT p.id, p.order_id, p.amount, p.payment_method, p.payment_status, p.transaction_id, o.created_at
             FROM payments p
             JOIN orders o ON p.order_id = o.id
             WHERE o.user_id = ?`,
            [user_id]
        );

        res.json(payments);
    } catch (err) {
        console.error("🔥 Fetch Payments Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🔹 Get Payment Details by ID (User Restriction Applied)
router.get('/:id', authMiddleware, async (req, res) => {
    const payment_id = req.params.id;
    const user_id = req.user.id;

    try {
        const [payment] = await db.promise().query(
            `SELECT p.id, p.order_id, p.amount, p.payment_method, p.payment_status, p.transaction_id, o.created_at
             FROM payments p
             JOIN orders o ON p.order_id = o.id
             WHERE p.id = ? AND o.user_id = ?`,
            [payment_id, user_id]
        );

        if (payment.length === 0) {
            return res.status(404).json({ error: "Payment not found or does not belong to you" });
        }

        res.json(payment[0]);

    } catch (err) {
        console.error("🔥 Fetch Payment Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
