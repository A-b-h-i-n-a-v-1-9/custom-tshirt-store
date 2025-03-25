const db = require("../config/db");
const { reduceStock } = require("../models/inventoryModel");

exports.placeOrder = async (req, res) => {
    const { userId, items, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: "Invalid order details" });
    }

    const connection = await db.promise().getConnection(); // Get connection for transaction

    try {
        await connection.beginTransaction();

        // Insert order into DB
        const orderQuery = "INSERT INTO orders (customer_id, payment_method, status) VALUES (?, ?, 'pending')";
        const [orderResult] = await connection.execute(orderQuery, [userId, paymentMethod]);

        const orderId = orderResult.insertId;

        // Insert order items & reduce inventory
        for (const item of items) {
            const { productId, quantity, price, productType } = item;

            await connection.execute(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
                [orderId, productId, quantity, price]
            );

            // Reduce inventory stock
            const stockUpdateResult = await new Promise((resolve, reject) => {
                reduceStock(productType, productId, quantity, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            if (!stockUpdateResult) {
                await connection.rollback();
                return res.status(400).json({ error: "Not enough stock available" });
            }
        }

        await connection.commit();
        res.status(200).json({ message: "Order placed successfully!" });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: "Failed to place order" });
    } finally {
        connection.release();
    }
};
