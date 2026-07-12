const { sendError } = require("../utils/responseHandler");

const errorHandler = (err, req, res, next) => {

    console.error("❌ Error:", err);

    const statusCode = err.statusCode || 500;

    sendError(
        res,
        err.message || "Internal Server Error",
        [],
        statusCode
    );
};

module.exports = errorHandler;