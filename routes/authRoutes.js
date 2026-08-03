const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload");

const {

    testAuth,

    register,

    login,

    universalLogin,

    profile,

    updateProfile,

    changePassword,

    requestAuthorization,

    getMyAuthorizationRequests,

    getApprovedLaboratories,

    getLaboratoryChemicals,

    submitPurchaseRequest,

    getMyPurchaseRequests,

    getPurchaseCode,

    dashboard,

    getPurchaseHistory,

    payPurchase,

    completeOnlineOrder,

    autoCompleteOrders

} = require("../controllers/authController");

router.get("/test", testAuth);

router.post("/register", register);

router.post(

    "/universal-login",

    universalLogin

);

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

    upload.single("proof_document"),

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

router.get(

    "/dashboard",

    authMiddleware,

    authorize("user"),

    dashboard

);

router.get(

    "/purchase-history",

    authMiddleware,

    authorize("user"),

    getPurchaseHistory

);

router.put(

    "/pay-purchase",

    authMiddleware,

    authorize("user"),

    payPurchase

);

router.put(

    "/complete-online-order",

    authMiddleware,

    authorize("user"),

    completeOnlineOrder

);

router.put(

    "/auto-complete-orders",

    authMiddleware,

    authorize("user"),

    autoCompleteOrders

);
module.exports = router;