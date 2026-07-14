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

    reactivateLaboratory

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
module.exports = router;