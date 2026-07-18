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

    getPurchaseReport

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


module.exports = router;