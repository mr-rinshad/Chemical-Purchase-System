const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const {

    testLaboratory,

    register,

    login,

    getProfile,

    verifyAuthorization,

    addChemical,

    getMyChemicals,

    getChemicalDetails,

    updateChemical,

    deleteChemical,

    updateChemicalStock,

    searchChemicals,

    filterChemicals,

    inventoryDashboard,

    getPurchaseRequests,

    approvePurchaseRequest,

    reservePurchaseRequest,

    completePurchase,

    expireReservations,

    dashboard,

    getPurchaseReport,

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

router.post(

    "/verify-authorization",

    authenticate,

    authorize("laboratory"),

    verifyAuthorization

);

router.post(

    "/chemicals",

    authenticate,

    authorize("laboratory"),

    addChemical

);

router.get(

    "/chemicals",

    authenticate,

    authorize("laboratory"),

    getMyChemicals

);

router.get(

    "/chemicals/search",

    authenticate,

    authorize("laboratory"),

    searchChemicals

);

router.get(

    "/chemicals/filter",

    authenticate,

    authorize("laboratory"),

    filterChemicals

);

router.get(

    "/inventory-dashboard",

    authenticate,

    authorize("laboratory"),

    inventoryDashboard

);

router.get(

    "/purchase-requests",

    authenticate,

    authorize("laboratory"),

    getPurchaseRequests

);

router.put(

    "/purchase-requests/:id/approve",

    authenticate,

    authorize("laboratory"),

    approvePurchaseRequest

);

router.put(

    "/purchase-requests/:id/reserve",

    authenticate,

    authorize("laboratory"),

    reservePurchaseRequest

);

router.get(

    "/chemicals/:id",

    authenticate,

    authorize("laboratory"),

    getChemicalDetails

);

router.put(

    "/chemicals/:id",

    authenticate,

    authorize("laboratory"),

    updateChemical

);

router.delete(

    "/chemicals/:id",

    authenticate,

    authorize("laboratory"),

    deleteChemical

);

router.put(

    "/chemicals/:id/stock",

    authenticate,

    authorize("laboratory"),

    updateChemicalStock

);

router.put(

    "/complete-purchase",

    authenticate,

    authorize("laboratory"),

    completePurchase

);

router.put(

    "/expire-reservations",

    authenticate,

    authorize("laboratory"),

    expireReservations

);

router.get(

    "/dashboard",

    authenticate,

    authorize("laboratory"),

    dashboard

);

router.get(

    "/reports/purchases",

    authenticate,

    authorize("laboratory"),

    getPurchaseReport

);


module.exports = router;