const bcrypt = require("bcrypt");

const Admin = require("../models/Admin");
const Laboratory = require("../models/Laboratory");
const ChemicalAuthorization = require("../models/ChemicalAuthorization");

const generateToken = require("../utils/generateToken");

const {

    sendSuccess,

    sendError

} = require("../utils/responseHandler");

const testAdmin = (req, res) => {

    sendSuccess(

        res,

        "Admin Controller Working"

    );

};

const login = async (req, res, next) => {

    try {

        const {

            email,

            password

        } = req.body;

        if (!email || !password) {

            return sendError(

                res,

                "Email and password are required",

                [],

                400

            );

        }

        const admin = await Admin.findByEmail(email);

        if (!admin) {

            return sendError(

                res,

                "Invalid email or password",

                [],

                401

            );

        }

        const isMatch = await bcrypt.compare(

            password,

            admin.password

        );

        if (!isMatch) {

            return sendError(

                res,

                "Invalid email or password",

                [],

                401

            );

        }

        const token = generateToken({

            id: admin.admin_id,

            email: admin.email,

            account_type: "admin"

        });

        sendSuccess(

            res,

            "Admin login successful",

            {

                token,

                admin: {

                    admin_id: admin.admin_id,

                    full_name: admin.full_name,

                    email: admin.email,

                    phone: admin.phone,

                    designation: admin.designation,

                    status: admin.status

                }

            }

        );

    }

    catch (error) {

        next(error);

    }

};

const getAllLaboratories = async (req, res, next) => {

    try {

        const laboratories = await Laboratory.findAll();

        sendSuccess(

            res,

            "Laboratories fetched successfully",

            laboratories

        );

    }

    catch (error) {

        next(error);

    }

};
const getPendingLaboratories = async (req, res, next) => {

    try {

        const laboratories = await Laboratory.findPending();

        sendSuccess(

            res,

            "Pending laboratories fetched successfully",

            laboratories

        );

    }

    catch (error) {

        next(error);

    }

};
const getLaboratoryDetails = async (req, res, next) => {

    try {

        const { id } = req.params;

        const laboratory = await Laboratory.findByLabId(id);

        if (!laboratory) {

            return sendError(

                res,

                "Laboratory not found",

                [],

                404

            );

        }

        sendSuccess(

            res,

            "Laboratory details fetched successfully",

            laboratory

        );

    }

    catch (error) {

        next(error);

    }

};

const approveLaboratory = async (req, res, next) => {

    try {

        const { id } = req.params;

        const laboratory = await Laboratory.findByLabId(id);

        if (!laboratory) {

            return sendError(

                res,

                "Laboratory not found",

                [],

                404

            );

        }

        if (laboratory.status === "Approved") {

            return sendError(

                res,

                "Laboratory is already approved",

                [],

                400

            );

        }

        await Laboratory.approveLab(id);

        sendSuccess(

            res,

            "Laboratory approved successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const rejectLaboratory = async (req, res, next) => {

    try {

        const { id } = req.params;

        const { reason } = req.body;

        if (!reason) {

            return sendError(

                res,

                "Rejection reason is required",

                [],

                400

            );

        }

        const laboratory = await Laboratory.findByLabId(id);

        if (!laboratory) {

            return sendError(

                res,

                "Laboratory not found",

                [],

                404

            );

        }

        if (laboratory.status === "Rejected") {

            return sendError(

                res,

                "Laboratory is already rejected",

                [],

                400

            );

        }

        await Laboratory.rejectLab(

            id,

            reason

        );

        sendSuccess(

            res,

            "Laboratory rejected successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const suspendLaboratory = async (req, res, next) => {

    try {

        const { id } = req.params;

        const laboratory = await Laboratory.findByLabId(id);

        if (!laboratory) {

            return sendError(

                res,

                "Laboratory not found",

                [],

                404

            );

        }

        if (laboratory.status === "Suspended") {

            return sendError(

                res,

                "Laboratory is already suspended",

                [],

                400

            );

        }

        await Laboratory.suspendLab(id);

        sendSuccess(

            res,

            "Laboratory suspended successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const reactivateLaboratory = async (req, res, next) => {

    try {

        const { id } = req.params;

        const laboratory = await Laboratory.findByLabId(id);

        if (!laboratory) {

            return sendError(

                res,

                "Laboratory not found",

                [],

                404

            );

        }

        if (laboratory.status !== "Suspended") {

            return sendError(

                res,

                "Only suspended laboratories can be reactivated",

                [],

                400

            );

        }

        await Laboratory.reactivateLab(id);

        sendSuccess(

            res,

            "Laboratory reactivated successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const getPendingAuthorizationRequests = async (req, res, next) => {

    try {

        const requests = await ChemicalAuthorization.findPending();

        sendSuccess(

            res,

            "Pending authorization requests fetched successfully",

            requests

        );

    }

    catch (error) {

        next(error);

    }

};

const approveAuthorizationRequest = async (req, res, next) => {

    try {

        const { id } = req.params;

        const authorization = await ChemicalAuthorization.findById(id);

        if (!authorization) {

            return sendError(

                res,

                "Authorization request not found",

                [],

                404

            );

        }

        if (authorization.status === "Approved") {

            return sendError(

                res,

                "Authorization request is already approved",

                [],

                400

            );

        }

        if (authorization.status !== "Pending") {

            return sendError(

                res,

                "Only pending authorization requests can be approved",

                [],

                400

            );

        }

        await ChemicalAuthorization.approve(id);

        sendSuccess(

            res,

            "Authorization request approved successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const rejectAuthorizationRequest = async (req, res, next) => {

    try {

        const { id } = req.params;

        const { reason } = req.body;

        if (!reason) {

            return sendError(

                res,

                "Rejection reason is required",

                [],

                400

            );

        }

        const authorization = await ChemicalAuthorization.findById(id);

        if (!authorization) {

            return sendError(

                res,

                "Authorization request not found",

                [],

                404

            );

        }

        if (authorization.status !== "Pending") {

            return sendError(

                res,

                "Only pending authorization requests can be rejected",

                [],

                400

            );

        }

        await ChemicalAuthorization.reject(

            id,

            reason

        );

        sendSuccess(

            res,

            "Authorization request rejected successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const dashboard = async (req, res, next) => {

    try {

        const statistics = await Admin.getDashboardStatistics();

        sendSuccess(

            res,

            "Dashboard loaded successfully",

            statistics

        );

    }

    catch (error) {

        next(error);

    }

};

const getPurchaseReport = async (req, res, next) => {

    try {

        const report = await Admin.getPurchaseReport();

        sendSuccess(

            res,

            "Purchase report fetched successfully",

            report

        );

    }

    catch (error) {

        next(error);

    }

};
module.exports = {

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

};