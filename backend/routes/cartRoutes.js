const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// 🛒 Add item to cart (Insert or Update)
router.post('/add', authMiddleware, (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    console.log("🛒 Add to Cart - Received Data:", { user_id, product_id, quantity });

    if (!product_id || !quantity) {
        return res.status(400).json({ error: "Product ID and quantity are required." });
    }

    db.query(
        `INSERT INTO cart (user_id, product_id, quantity) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
        [user_id, product_id, quantity],
        (err, result) => {
            console.log("🛒 SQL Query Result:", result);

            if (err) {
                console.error("🔥 Database Error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Item added to cart!", affectedRows: result.affectedRows });
        }
    );
});

// 🛍 Get user's cart
router.get('/', authMiddleware, (req, res) => {
    const user_id = req.user.id;

    db.query(
        `SELECT c.id, p.name, p.price, c.quantity, p.image, p.description
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

// ❌ Remove item from cart
router.delete('/remove/:id', authMiddleware, (req, res) => {
    const user_id = req.user.id;
    const cart_id = req.params.id;

    db.query("DELETE FROM cart WHERE id = ? AND user_id = ?", [cart_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item removed from cart" });
    });
});

router.put('/update', authMiddleware, (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    if (!product_id || quantity === undefined) {
        return res.status(400).json({ error: "Product ID and quantity are required." });
    }

    // Debug log to check the incoming data
    console.log("🛒 Update Cart - Data:", { product_id, quantity, user_id });

    // Check if the product exists in the cart
    db.query(
        "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
        [user_id, product_id],
        (err, result) => {
            if (err) {
                console.error("🔥 Error checking cart:", err);
                return res.status(500).json({ error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: "Product not found in cart." });
            }

            // Proceed to update the quantity
            db.query(
                "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
                [quantity, user_id, product_id],
                (err, updateResult) => {
                    if (err) {
                        console.error("🔥 Error updating cart:", err);
                        return res.status(500).json({ error: err.message });
                    }

                    console.log("🛒 Update Cart SQL Result:", updateResult);

                    if (updateResult.changedRows === 0) {
                        return res.status(400).json({ message: "Quantity is already up to date." });
                    }

                    res.json({ message: "Cart item updated!", affectedRows: updateResult.affectedRows });
                }
            );
        }
    );
});




module.exports = router;
