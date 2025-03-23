const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10, // ✅ Supports multiple connections
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// ✅ Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL Connection Failed:', err);
    } else {
        console.log('✅ MySQL Pool Connected!');
        connection.release(); // ✅ Release connection after testing
    }
});

module.exports = pool;
