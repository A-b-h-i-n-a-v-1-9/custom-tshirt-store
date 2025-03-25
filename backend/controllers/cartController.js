const db = require("../config/db");

exports.getCartItems = (req, res) => {
    const { userId } = req.body;

    db.query(
        "SELECT c.id, p.name, p.price, c.quantity, i.quantity AS stock FROM cart c JOIN products p ON c.product_id = p.id JOIN inventory i ON p.id = i.id WHERE c.user_id = ?",
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: "Failed to fetch cart" });

            res.status(200).json(results);
        }
    );
};
