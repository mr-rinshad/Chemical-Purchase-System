const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

const { sendSuccess, sendError } = require("./utils/responseHandler");
const errorHandler = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const laboratoryRoutes = require("./routes/laboratoryRoutes");

// Load Environment Variables
dotenv.config();

// Database Connection
require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(

    "/uploads",

    express.static(

        path.join(__dirname, "uploads")

    )

);

// Serve Frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Authentication Routes
app.use("/api/auth", authRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

// Laboratory Routes
app.use("/api/laboratory", laboratoryRoutes);

// Port
const PORT = process.env.PORT || 3000;

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

// Serve Frontend Home Page
app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "frontend", "index.html"));

});

// 404 Route
app.use((req, res, next) => {

    const error = new Error("Route Not Found");

    error.statusCode = 404;

    next(error);

});

// Error Handling Middleware
app.use(errorHandler);

const PurchaseRequest = require("./models/PurchaseRequest");

// Background runner for auto-completing 2-day paid online orders and expiring unpaid reservations
const runBackgroundOrderProcessing = async () => {
    try {
        await PurchaseRequest.autoCompleteOrders();
        await PurchaseRequest.expireUnpaidReservations();
    } catch (err) {
        console.error("Background order processing error:", err.message);
    }
};

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    // Run immediately on server start and then every 30 seconds
    runBackgroundOrderProcessing();
    setInterval(runBackgroundOrderProcessing, 30 * 1000);
});