const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const {

    testAdmin,

    login,

    getAllLaboratories,

    getPendingLaboratories,

    getLaboratoryDetails,

    approveLaboratory,

    rejectLaboratory,

    suspendLaboratory,

    reactivateLaboratory,

    getPendingAuthorizationRequests,

    approveAuthorizationRequest,

    rejectAuthorizationRequest,

    dashboard,

    getPurchaseReport,

    getAllUsers,

    searchUsers,

    getUserDetails,

    registerLicense,

    getAllLicenses,

    getLicenseDetails,

    updateLicense,

    deleteLicense,

    getApprovedAuthorizationRequests


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
router.get(

    "/dashboard",

    authenticate,

    authorize("admin"),

    dashboard

);

router.get(

    "/laboratories",

    authenticate,

    authorize("admin"),

    getAllLaboratories

);

router.get(

    "/laboratories/pending",

    authenticate,

    authorize("admin"),

    getPendingLaboratories

);

router.get(

    "/laboratories/:id",

    authenticate,

    authorize("admin"),

    getLaboratoryDetails

);

router.put(

    "/laboratories/:id/approve",

    authenticate,

    authorize("admin"),

    approveLaboratory

);

router.put(

    "/laboratories/:id/reject",

    authenticate,

    authorize("admin"),

    rejectLaboratory

);

router.put(

    "/laboratories/:id/suspend",

    authenticate,

    authorize("admin"),

    suspendLaboratory

);

router.put(

    "/laboratories/:id/reactivate",

    authenticate,

    authorize("admin"),

    reactivateLaboratory

);

router.get(

    "/authorizations/pending",

    authenticate,

    authorize("admin"),

    getPendingAuthorizationRequests

);

router.put(

    "/authorizations/:id/approve",

    authenticate,

    authorize("admin"),

    approveAuthorizationRequest

);

router.put(

    "/authorizations/:id/reject",

    authenticate,

    authorize("admin"),

    rejectAuthorizationRequest

);

router.get(

    "/reports/purchases",

    authenticate,

    authorize("admin"),

    getPurchaseReport

);

router.get(

    "/users",

    authenticate,

    authorize("admin"),

    getAllUsers

);

router.get(

    "/users/search",

    authenticate,

    authorize("admin"),

    searchUsers

);

router.get(

    "/users/:id",

    authenticate,

    authorize("admin"),

    getUserDetails

);

// ===========================================
// LAB LICENSE REGISTRATION
// ===========================================

// Register New License
router.post(

    "/licenses",

    authenticate,

    authorize("admin"),

    registerLicense

);

// Get All Licenses
router.get(

    "/licenses",

    authenticate,

    authorize("admin"),

    getAllLicenses

);

// Get License Details
router.get(

    "/licenses/:id",

    authenticate,

    authorize("admin"),

    getLicenseDetails

);

router.put(

    "/licenses/:id",

    authenticate,

    authorize("admin"),

    updateLicense

);

router.delete(

    "/licenses/:id",

    authenticate,

    authorize("admin"),

    deleteLicense

);

router.get(

    "/authorizations/approved",

    authenticate,

    authorize("admin"),

    getApprovedAuthorizationRequests

);

module.exports = router;