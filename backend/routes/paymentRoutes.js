const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');
require('dotenv').config();

const router = express.Router();

// 🔹 Make a Payment
router.post('/', authMiddleware, (req, res) => {
    const { order_id, amount, payment_method } = req.body;

    if (!order_id || !amount || !payment_method) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const transactionId = `TXN${Math.floor(10000 + Math.random() * 90000)}`; // Generate fake transaction ID
    const sql = "INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [order_id, amount, payment_method, 'completed', transactionId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Payment successful", transaction_id: transactionId });
    });
});

// 🔹 Get All Payments
router.get('/', authMiddleware, (req, res) => {
    db.query("SELECT * FROM payments", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔹 Get Payment Details by ID
router.get('/:id', authMiddleware, (req, res) => {
    const payment_id = req.params.id;

    db.query("SELECT * FROM payments WHERE id = ?", [payment_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Payment not found" });

        res.json(result[0]);
    });
});

module.exports = router;
