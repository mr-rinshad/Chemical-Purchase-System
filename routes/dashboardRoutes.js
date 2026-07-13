const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");

const authorize = require("../middleware/authorize");

const {

    getDashboardStats

} = require("../controllers/dashboardController");

router.get(

    "/stats",

    authenticate,

    authorize("admin"),

    getDashboardStats

);

module.exports = router;