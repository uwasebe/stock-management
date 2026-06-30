const mysql = require('mysql2/promise'); // HAKOSOWE: Haje '/promise' ngo bikore kuri paji zose rusange!
require('dotenv').config();

// Gukora Connection Pool ifite amasezerano (Promise-based Pool)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'berwashop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Genzurira hano niba database ifunguka neza
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to the Berwashop database successfully with Promises!');
        connection.release();
    } catch (err) {
        console.error('❌ Error connecting to the database:', err.message);
    }
})();

module.exports = pool;