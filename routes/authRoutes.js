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

    getMyAuthorizationRequests,

    getApprovedLaboratories,

    getLaboratoryChemicals,

    submitPurchaseRequest,

    getMyPurchaseRequests,

    getPurchaseCode

} = require("../controllers/authController");

router.get("/test", testAuth);

router.post("/register", register);

router.post("/login", login);

router.get(

    "/laboratories",

    authMiddleware,

    authorize("user"),

    getApprovedLaboratories

);

router.get(

    "/laboratories/:labId/chemicals",

    authMiddleware,

    authorize("user"),

    getLaboratoryChemicals

);

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

router.post(

    "/purchase-request",

    authMiddleware,

    authorize("user"),

    submitPurchaseRequest

);

router.get(

    "/purchase-requests",

    authMiddleware,

    authorize("user"),

    getMyPurchaseRequests

);

router.get(

    "/purchase-requests/:id/purchase-code",

    authMiddleware,

    authorize("user"),

    getPurchaseCode

);
module.exports = router;