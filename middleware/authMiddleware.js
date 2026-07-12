const jwt = require("jsonwebtoken");

const { sendError } = require("../utils/responseHandler");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return sendError(

                res,

                "Access denied. Token not provided.",

                [],

                401

            );

        }

        if (!authHeader.startsWith("Bearer ")) {

            return sendError(

                res,

                "Invalid authorization format.",

                [],

                401

            );

        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        req.user = decoded;

        next();

    }

    catch (error) {

        return sendError(

            res,

            "Invalid or expired token.",

            [],

            401

        );

    }

};

module.exports = authMiddleware;