const db = require('../config/db'); // ✅ Ensure you have a valid DB connection

// Add Product
const addProduct = async (req, res) => {
    const { name, price, description } = req.body;
    if (!name || !price) return res.status(400).json({ error: "Name & Price required" });

    try {
        const query = "INSERT INTO products (name, price, description) VALUES (?, ?, ?)";
        await db.query(query, [name, price, description]);
        res.status(201).json({ message: "Product added successfully" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
};

// Get Products
const getProducts = async (req, res) => {
    try {
        const [products] = await db.query("SELECT * FROM products");
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    const { name, price, description } = req.body;
    const { id } = req.params;

    try {
        const query = "UPDATE products SET name=?, price=?, description=? WHERE id=?";
        await db.query(query, [name, price, description, id]);
        res.status(200).json({ message: "Product updated" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM products WHERE id=?", [id]);
        res.status(200).json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
};

// ✅ Make sure to export functions correctly
module.exports = {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct
};
