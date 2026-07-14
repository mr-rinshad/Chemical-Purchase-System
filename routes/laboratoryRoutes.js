const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const {

    testLaboratory,

    register,

    login,

    getProfile

} = require("../controllers/laboratoryController");

// Public Routes

router.post(

    "/register",

    register

);

router.post(

    "/login",

    login

);

// Protected Routes

router.get(

    "/test",

    authenticate,

    authorize("laboratory"),

    testLaboratory

);

router.get(

    "/profile",

    authenticate,

    authorize("laboratory"),

    getProfile

);

module.exports = router;