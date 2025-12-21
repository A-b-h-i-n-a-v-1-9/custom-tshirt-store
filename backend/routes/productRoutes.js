const express = require('express');
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware'); // ✅ Fix import

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
    const sql = `
        SELECT p.*, 
               t.size AS t_size, t.color AS t_color, t.fabric AS t_fabric, t.stock AS t_stock,
               m.material AS m_material, m.capacity_ml AS m_capacity, m.stock AS m_stock,
               b.material AS b_material, b.capacity_ml AS b_capacity, b.stock AS b_stock
        FROM products p
        LEFT JOIN t_shirts t ON p.id = t.product_id
        LEFT JOIN mugs m ON p.id = m.product_id
        LEFT JOIN bottles b ON p.id = b.product_id;
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const products = results.map(product => {
            let extraDetails = {};

            // Handle t_shirt category
            if (product.category === "t_shirt") {
                extraDetails = {
                    size: product.t_size || "N/A", // Handle null with default value
                    color: product.t_color || "N/A",
                    fabric: product.t_fabric || "N/A"
                };
                product.stock = product.t_stock || 0; // Default stock if null
            }

            // Handle mug category
            else if (product.category === "mugs") {
                extraDetails = {
                    material: product.m_material || "N/A",
                    capacity: product.m_capacity || "N/A"
                };
                product.stock = product.m_stock || 0; // Default stock if null
            }

            // Handle bottle category
            else if (product.category === "bottles") {
                extraDetails = {
                    material: product.b_material || "N/A",
                    capacity: product.b_capacity || "N/A"
                };
                product.stock = product.b_stock || 0; // Default stock if null
            }

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                image: product.image,
                stock: product.stock,
                extraDetails
            };
        });

        res.json(products);
    });
});



// Get a single product by ID
router.get('/:id', (req, res) => {
    const productId = req.params.id;

    const sql = `
        SELECT p.*, 
               t.size, t.color, t.fabric, t.stock AS tshirt_stock, 
               m.material AS mug_material, m.capacity_ml AS mug_capacity, m.stock AS mug_stock, 
               b.material AS bottle_material, b.capacity_ml AS bottle_capacity, b.stock AS bottle_stock
        FROM products p
        LEFT JOIN t_shirts t ON p.id = t.product_id
        LEFT JOIN mugs m ON p.id = m.product_id
        LEFT JOIN bottles b ON p.id = b.product_id
        WHERE p.id = ?;
    `;

    db.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) return res.status(404).json({ error: "Product not found" });

        const product = results[0]; // Only one result expected for a specific ID
        let extraDetails = {};

        switch (product.category) {
            case "t_shirt":
                extraDetails = {
                    size: product.size,
                    color: product.color,
                    fabric: product.fabric
                };
                product.stock = product.tshirt_stock; // Assign correct stock
                break;

            case "mug":
                extraDetails = {
                    material: product.mug_material,
                    capacity: product.mug_capacity
                };
                product.stock = product.mug_stock;
                break;

            case "bottle":
                extraDetails = {
                    material: product.bottle_material,
                    capacity: product.bottle_capacity
                };
                product.stock = product.bottle_stock;
                break;
        }

        const response = {
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            image: product.image,
            stock: product.stock,
            extraDetails
        };

        res.json(response);
    });
});




// Add new product (Admin only)
router.post('/add', (req, res) => {
    const { name, description, category, price, image, stock } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: "Name, price, and category are required" });
    }

    // Insert into products table first
    const sqlProduct = "INSERT INTO products (name, description, category, price, image) VALUES (?, ?, ?, ?, ?)";
    db.query(sqlProduct, [name, description, category, price, image], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const product_id = result.insertId; // Get the inserted product ID

        // Handle category-wise insertion
        switch (category) {
            case "t_shirt":
                const { size, color, fabric } = req.body;
                if (!size || !color) {
                    return res.status(400).json({ error: "Size and color are required for t-shirts" });
                }
                
                const sqlTShirt = "INSERT INTO t_shirts (product_id, size, color, fabric, stock) VALUES (?, ?, ?, ?, ?)";
                db.query(sqlTShirt, [product_id, size, color, fabric || null, stock || 0], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "T-Shirt added successfully!", product_id });
                });
                break;

            case "mug":
                const { material, capacity_ml } = req.body;
                if (!material || !capacity_ml) {
                    return res.status(400).json({ error: "Material and capacity are required for mugs" });
                }

                const sqlMug = "INSERT INTO mugs (product_id, material, capacity_ml, stock) VALUES (?, ?, ?, ?)";
                db.query(sqlMug, [product_id, material, capacity_ml, stock || 0], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Mug added successfully!", product_id });
                });
                break;

            case "bottle":
                const { bottle_material, bottle_capacity_ml } = req.body;
                if (!bottle_material || !bottle_capacity_ml) {
                    return res.status(400).json({ error: "Material and capacity are required for bottles" });
                }

                const sqlBottle = "INSERT INTO bottles (product_id, material, capacity_ml, stock) VALUES (?, ?, ?, ?)";
                db.query(sqlBottle, [product_id, bottle_material, bottle_capacity_ml, stock || 0], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Bottle added successfully!", product_id });
                });
                break;

            default:
                res.json({ message: "Product added, but no category-specific table exists.", product_id });
        }
    });
});

// Delete a product by ID
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;

    // First, find the category of the product
    db.query("SELECT category FROM products WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const category = results[0].category;

        // Define queries for category-specific deletions
        let deleteCategoryQuery = "";
        switch (category) {
            case "t_shirt":
                deleteCategoryQuery = "DELETE FROM t_shirts WHERE product_id = ?";
                break;
            case "mug":
                deleteCategoryQuery = "DELETE FROM mugs WHERE product_id = ?";
                break;
            case "bottle":
                deleteCategoryQuery = "DELETE FROM bottles WHERE product_id = ?";
                break;
        }

        // If there's a category-specific table, delete from it first
        if (deleteCategoryQuery) {
            db.query(deleteCategoryQuery, [id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
            });
        }

        // Finally, delete from the products table
        db.query("DELETE FROM products WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Product deleted successfully!" });
        });
    });
});


module.exports = router;

