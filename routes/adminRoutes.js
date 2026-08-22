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

    updateUserStatus,

    registerLicense,

    getAllLicenses,

    getLicenseDetails,

    updateLicense,

    deleteLicense,

    getApprovedAuthorizationRequests,

    getPurchaseMonitor,

    getProfile,

    updateProfile,

    changePassword,

    createAdmin,

    getAllAdmins,

    getAdmin,

    updateAdmin,

    deleteAdmin


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

router.put(

    "/users/:id/status",

    authenticate,

    authorize("admin"),

    updateUserStatus

);
router.get(

    "/purchase-monitor",

    authenticate,

    authorize("admin"),

    getPurchaseMonitor

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

router.get(

    "/profile",

    authenticate,

    authorize("admin"),

    getProfile

);

router.put(

    "/profile",

    authenticate,

    authorize("admin"),

    updateProfile

);

router.put(

    "/change-password",

    authenticate,

    authorize("admin"),

    changePassword

);

router.post(

    "/create",

    authenticate,

    authorize("admin"),

    createAdmin

);

// ==============================
// Manage Admins
// ==============================

// Get All Admins
router.get(

    "/admins",

    authenticate,

    authorize("admin"),

    getAllAdmins

);

// Get Single Admin
router.get(

    "/admins/:id",

    authenticate,

    authorize("admin"),

    getAdmin

);

// Update Admin
router.put(

    "/admins/:id",

    authenticate,

    authorize("admin"),

    updateAdmin

);

// Delete Admin
router.delete(

    "/admins/:id",

    authenticate,

    authorize("admin"),

    deleteAdmin

);

module.exports = router;