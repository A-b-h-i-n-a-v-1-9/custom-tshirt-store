const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware'); // ✅ Check if it's properly imported
require('dotenv').config();

const router = express.Router();

// User Signup
router.post('/signup', async (req, res) => {
    const { name, email, password, phone, street, city, state, zip_code, country } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: "Name, email, password, and phone are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";

        db.query(sql, [name, email, hashedPassword, phone, 'user'], (err, result) => { 
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "User registered successfully!" });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// User Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: "User not found" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            }
        });
    });
});

// Get User Profile (Public Route)
router.get('/profile', (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const sql = `
        SELECT 
            u.id, u.name, u.email, u.phone, u.role,
            a.street, a.city, a.state, a.zip_code, a.country
        FROM users u
        LEFT JOIN user_addresses a ON u.id = a.user_id AND a.is_default = TRUE
        WHERE u.id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "User not found" });

        const user = results[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            address: user.street ? {  // Only include address if exists
                street: user.street,
                city: user.city,
                state: user.state,
                zip_code: user.zip_code,
                country: user.country
            } : null
        });
    });
});

router.post('/checkout/address', authMiddleware, (req, res) => {
    const { street, city, state, zip_code, country } = req.body;
    const userId = req.user.id; // Extract from JWT token

    if (!street || !city || !state || !zip_code || !country) {
        return res.status(400).json({ error: "All address fields are required" });
    }

    // Check if user already has a default address
    db.query("SELECT * FROM user_addresses WHERE user_id = ? AND is_default = TRUE", [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const isDefault = results.length === 0 ? true : false; // Set default only if no other exists

        // Insert new address
        const sql = "INSERT INTO user_addresses (user_id, street, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [userId, street, city, state, zip_code, country, isDefault], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Address added successfully!", is_default: isDefault });
        });
    });
});

router.get('/checkout/address', authMiddleware, (req, res) => {
    const userId = req.user.id;

    db.query("SELECT * FROM user_addresses WHERE user_id = ?", [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.json({ message: "No address found. Please add an address at checkout." });
        }

        res.json(results);
    });
});

router.put('/profile/address/:id', authMiddleware, (req, res) => {
    const { street, city, state, zip_code, country } = req.body;
    const { id } = req.params;
    const userId = req.user.id; 

    if (!street || !city || !state || !zip_code || !country) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "UPDATE user_addresses SET street = ?, city = ?, state = ?, zip_code = ?, country = ? WHERE id = ? AND user_id = ?";
    db.query(sql, [street, city, state, zip_code, country, id, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Address not found or unauthorized" });
        }

        res.json({ message: "Address updated successfully!" });
    });
});

router.post('/logout', (req, res) => {
    try {
      // Clear the HTTP-only cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Export the router
module.exports = router;
