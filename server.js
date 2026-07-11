const express = require("express");
const dotenv = require("dotenv");

const { sendSuccess, sendError } = require("./utils/responseHandler");

// Load Environment Variables
dotenv.config();

// Database Connection
require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Port
const PORT = process.env.PORT || 3000;

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to Chemical Purchase System API");
});

// Test API
app.get("/api/test", (req, res) => {
    sendSuccess(
        res,
        "API is working successfully!",
        {
            version: "1.0.0"
        }
    );
});

// Error Test API
app.get("/api/error-test", (req, res) => {
    sendError(
        res,
        "This is a sample error response",
        [],
        400
    );
});

// Health Check Route
app.get("/health", (req, res) => {
    res.json({
        success: true,
        server: "Running",
        database: "Connected"
    });
});

app.get("/api/project", (req, res) => {
    sendSuccess(
        res,
        "Project information fetched successfully",
        {
            projectName: "Chemical Purchase System",
            version: "1.0.0",
            developer: "Muhammed Rinshad"
        }
    );
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});