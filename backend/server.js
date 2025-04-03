const express = require('express'); 
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // ✅ Import cookie-parser
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes'); // ✅ Add missing checkoutRoutes

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cookieParser()); // ✅ Enable cookie parsing
app.use(
    cors({
      origin: "http://localhost:3000", // ✅ Allow frontend origin
      credentials: true, // ✅ Allow cookies & auth headers
    })
);

// Check if essential environment variables are set
if (!process.env.JWT_SECRET) {
    console.error("❌ Error: JWT_SECRET is not defined in .env file");
    process.exit(1);
}

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error("❌ Error: Database credentials are missing in .env file");
    process.exit(1);
}

// Ensure database connection is successful
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    } else {
        console.log("✅ MySQL Connected!");
        connection.release();
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/checkout', checkoutRoutes); // ✅ Add the checkoutRoutes here

// Root Route
app.get('/', (req, res) => res.send('🛒 T-Shirt Store API Running...'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
