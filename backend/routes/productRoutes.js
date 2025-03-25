const express = require('express');
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware'); // ✅ Fix import

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add new product (Admin only)
router.post('/add', (req, res) => {
    const { name, description, category, price, image, stock } = req.body;

    if (!name || !price || !category || !stock) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "INSERT INTO products (name, description, category, price, image, stock) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, description, category, price, image, stock], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product added successfully!", product_id: result.insertId });
    });
});

module.exports = router;
