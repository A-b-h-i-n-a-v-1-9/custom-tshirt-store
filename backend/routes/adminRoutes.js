const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getUsers, getOrders, getPayments, getAdminStats } = require('../controllers/adminController');


const router = express.Router();

// Get all users (Admin Only)
router.get('/users', authMiddleware, adminMiddleware, getUsers);

// Get all orders (Admin Only)
router.get('/orders', authMiddleware, adminMiddleware, getOrders);

// Get all payments (Admin Only)
router.get('/payments', authMiddleware, adminMiddleware, getPayments);

// Get Admin Stats
router.get('/stats', authMiddleware, adminMiddleware, getAdminStats);

module.exports = router;
