const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const {

    testAdmin,

    login

} = require("../controllers/adminController");

router.get(
    "/test",
    authenticate,
    authorize("admin"),
    testAdmin
);

router.post(

    "/login",

    login

);

module.exports = router;