const express = require('express');
const router = express.Router();
const inventoryModel = require('../models/inventoryModel');

// Add a new T-Shirt
router.post('/products/tshirt', (req, res) => {
    inventoryModel.addTShirt(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Add a new Mug
router.post('/products/mug', (req, res) => {
    inventoryModel.addMug(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Add a new Bottle
router.post('/products/bottle', (req, res) => {
    inventoryModel.addBottle(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Get All Products
router.get('/products', (req, res) => {
    const query = `
        SELECT i.id, i.type, 
        CASE 
            WHEN i.type = 'tshirt' THEN (SELECT size FROM t_shirts WHERE inventory_id = i.id)
            WHEN i.type = 'mug' THEN (SELECT size FROM mugs WHERE inventory_id = i.id)
            WHEN i.type = 'bottle' THEN (SELECT size_ml FROM bottles WHERE inventory_id = i.id)
        END AS size,
        (SELECT price FROM t_shirts WHERE inventory_id = i.id) AS price
        FROM inventory i
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database Error" });
        res.json(results);
    });
});

module.exports = router;
