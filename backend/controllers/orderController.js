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
        let totalPrice = 0;

        // Insert order items & reduce inventory
        for (const item of items) {
            const { productId, quantity, price, productType } = item;
            totalPrice += quantity * parseFloat(price);

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
        console.log("✅ Order placed. Order ID:", orderId);
console.log("💰 Preparing to insert payment record:", {
    orderId,
    totalPrice,
    paymentMethod,
    status: paymentMethod === "COD" ? "pending" : "completed",
});


        // ✅ Insert payment record
        await connection.execute(
            "INSERT INTO payments (order_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)",
            [orderId, totalPrice, paymentMethod, paymentMethod === "COD" ? "pending" : "completed"]
        );

        await connection.commit();
        res.status(200).json({ message: "Order placed successfully!", orderId });

    } catch (err) {
        await connection.rollback();
        console.error("🔥 Order Placement Failed:", err);
        res.status(500).json({ error: "Failed to place order" });
    } finally {
        connection.release();
    }
};
