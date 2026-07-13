const {

    sendSuccess

} = require("../utils/responseHandler");

const getDashboardStats = async (req, res, next) => {

    try {

        sendSuccess(

            res,

            "Dashboard API Working",

            {}

        );

    }

    catch (error) {

        next(error);

    }

};

module.exports = {

    getDashboardStats

};