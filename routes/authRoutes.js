const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

    testAuth,

    register,

    login,

    profile,

    updateProfile,

    changePassword

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

module.exports = router;