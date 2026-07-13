const adminAuthMiddleware = (req, res, next) => {

    console.log("Admin Authentication Middleware Executed");

    next();

};

module.exports = adminAuthMiddleware;