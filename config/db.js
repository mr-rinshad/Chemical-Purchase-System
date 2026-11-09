const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({
    path: path.join(__dirname, "..", ".env")
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync(
            path.join(__dirname, "..", "ca.pem")
        ),
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database Connection Failed:", err.message);
        return;
    }

    console.log("MySQL Database Connected Successfully");

    connection.release();
});

module.exports = pool.promise();