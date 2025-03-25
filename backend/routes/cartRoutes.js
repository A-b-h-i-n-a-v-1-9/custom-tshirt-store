const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware'); // ✅ Fix Import

const router = express.Router();

// Add item to cart
router.post('/add', authMiddleware, (req, res) => { // ✅ Correct Middleware Usage
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    db.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?",
        [user_id, product_id, quantity, quantity],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Item added to cart!" });
        }
    );
});

// Get user's cart
router.get('/', authMiddleware, (req, res) => { // ✅ Correct Middleware Usage
    const user_id = req.user.id;

    db.query(`
        SELECT c.id, p.name, p.price, c.quantity
        FROM cart c 
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?`,
        [user_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// Remove item from cart
router.delete('/remove/:id', authMiddleware, (req, res) => { // ✅ Correct Middleware Usage
    const user_id = req.user.id;
    const cart_id = req.params.id;

    db.query("DELETE FROM cart WHERE id = ? AND user_id = ?", [cart_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item removed from cart" });
    });
});

module.exports = router;


