const db = require('../config/db'); // MySQL connection

// Get all users
exports.getUsers = (req, res) => {
    db.query('SELECT id, name, email, role FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
};

// Get all orders
exports.getOrders = (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
};

// Get all payments
exports.getPayments = (req, res) => {
    db.query('SELECT * FROM payments', (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
};
