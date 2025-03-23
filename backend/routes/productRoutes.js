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
router.post('/', authMiddleware, adminMiddleware, (req, res) => { // ✅ Use both middlewares properly
    const { name, description, price, image } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required." });
    }

    db.query(
        "INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)",
        [name, description, price, image],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Product added successfully!" });
        }
    );
});

module.exports = router;
