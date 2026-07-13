const jwt = require("jsonwebtoken");

const { sendError } = require("../utils/responseHandler");

const authenticate = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            return sendError(

                res,

                "Access token is missing",

                [],

                401

            );

        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        console.log("Decoded Token:", decoded);

        req.user = decoded;

        next();

    }

    catch (error) {

        return sendError(

            res,

            "Invalid or expired token",

            [],

            401

        );

    }

};

module.exports = authenticate;