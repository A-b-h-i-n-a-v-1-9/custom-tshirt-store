const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Place an order
router.post('/place', authMiddleware, (req, res) => {
    const { cartItems, totalPrice, address } = req.body;
    const user_id = req.user.id;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    db.query(
        "INSERT INTO orders (user_id, total_price, address) VALUES (?, ?, ?)",
        [user_id, totalPrice, address],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const order_id = result.insertId;
            const values = cartItems.map(item => [order_id, item.product_id, item.quantity]);

            const insertOrderItemsQuery = "INSERT INTO order_items (order_id, product_id, quantity) VALUES ?";
            db.query(insertOrderItemsQuery, [values], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });

                res.json({ message: "Order placed successfully!", order_id });
            });
        }
    );
});

// Get user orders
router.get('/', authMiddleware, (req, res) => {
    const user_id = req.user.id;

    db.query(
        `SELECT o.id, o.total_price, o.address, o.created_at, 
         JSON_ARRAYAGG(JSON_OBJECT('product_id', oi.product_id, 'quantity', oi.quantity)) AS items
         FROM orders o 
         JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = ?
         GROUP BY o.id`,
        [user_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

module.exports = router;
