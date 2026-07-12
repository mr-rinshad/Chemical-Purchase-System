const express = require("express");
const dotenv = require("dotenv");

const { sendSuccess, sendError } = require("./utils/responseHandler");
const errorHandler = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");

// Load Environment Variables
dotenv.config();

// Database Connection
require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Routes
app.use("/api/auth", authRoutes);

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

// Project Information Route
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

// Crash Test Route
app.get("/api/crash", (req, res, next) => {

    const error = new Error("This is a sample server error");

    error.statusCode = 500;

    next(error);

});

// 404 Route
app.use((req, res, next) => {

    const error = new Error("Route Not Found");

    error.statusCode = 404;

    next(error);

});

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});