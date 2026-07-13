const { sendError } = require("../utils/responseHandler");

const authorize = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.account_type)) {

            return sendError(

                res,

                "You are not authorized to access this resource",

                [],

                403

            );

        }

        next();

    };

};

module.exports = authorize;