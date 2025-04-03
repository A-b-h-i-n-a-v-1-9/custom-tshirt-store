// routes/checkoutRoutes.js
const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Add Address at Checkout
router.post('/address', authMiddleware, (req, res) => {
    const { street, city, state, zip_code, country } = req.body;
    const userId = req.user.id;

    if (!street || !city || !state || !zip_code || !country) {
        return res.status(400).json({ error: "All address fields are required" });
    }

    db.query("SELECT * FROM user_addresses WHERE user_id = ? AND is_default = TRUE", [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const isDefault = results.length === 0 ? true : false;

        const sql = "INSERT INTO user_addresses (user_id, street, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [userId, street, city, state, zip_code, country, isDefault], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Address added successfully!", is_default: isDefault });
        });
    });
});

// Get User Checkout Addresses
router.get('/address', authMiddleware, (req, res) => {
    const userId = req.user.id;

    db.query("SELECT * FROM user_addresses WHERE user_id = ?", [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.json({ message: "No address found. Please add an address at checkout." });
        }

        res.json(results);
    });
});

module.exports = router;
