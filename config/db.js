const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
        return;
    }

    console.log("✅ MySQL Database Connected Successfully");

    connection.query("SELECT NOW() AS currentTime", (err, results) => {
        if (!err) {
            console.log("📅 Database Time:", results[0].currentTime);
        }
    });

    connection.release();
});

module.exports = pool.promise();