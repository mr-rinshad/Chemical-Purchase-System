const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {

    testAuth,

    register,

    login,

    profile,

    updateProfile,

    changePassword,

    requestAuthorization,

    getMyAuthorizationRequests

} = require("../controllers/authController");

router.get("/test", testAuth);

router.post("/register", register);

router.post("/login", login);

router.get(

    "/profile",

    authMiddleware,

    profile

);

router.put(

    "/profile",

    authMiddleware,

    updateProfile

);

router.put(

    "/change-password",

    authMiddleware,

    changePassword

);

router.post(

    "/authorization-request",

    authMiddleware,

    authorize("user"),

    requestAuthorization

);

router.get(

    "/authorization-requests",

    authMiddleware,

    authorize("user"),

    getMyAuthorizationRequests

);
module.exports = router;