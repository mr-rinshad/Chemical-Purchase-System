const bcrypt = require("bcrypt");

const Admin = require("../models/Admin");
const Laboratory = require("../models/Laboratory");
const User = require("../models/User");
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

            account_type: "admin",

            is_super_admin: admin.is_super_admin

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

                    status: admin.status,

                    is_super_admin: admin.is_super_admin

                }

            }

        );

    }

    catch (error) {

        next(error);

    }

};

const getProfile = async (req, res, next) => {

    try {

        const admin = await Admin.findById(

            req.user.id

        );

        if (!admin) {

            return sendError(

                res,

                "Admin not found",

                [],

                404

            );

        }

        sendSuccess(

            res,

            "Profile fetched successfully",

            admin

        );

    }

    catch (error) {

        next(error);

    }

};

const updateProfile = async (req, res, next) => {

    try {

        const {

            full_name,

            phone

        } = req.body;

        if (

            !full_name ||

            !phone

        ) {

            return sendError(

                res,

                "Full name and phone are required",

                [],

                400

            );

        }

        await Admin.updateProfile(

            req.user.id,

            full_name,

            phone

        );

        sendSuccess(

            res,

            "Profile updated successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const changePassword = async (req, res, next) => {

    try {

        const {

            current_password,

            new_password,

            confirm_password

        } = req.body;

        if (

            !current_password ||

            !new_password ||

            !confirm_password

        ) {

            return sendError(

                res,

                "All fields are required",

                [],

                400

            );

        }

        if (

            new_password !== confirm_password

        ) {

            return sendError(

                res,

                "New passwords do not match",

                [],

                400

            );

        }

        const admin = await Admin.findPasswordById(

            req.user.id

        );

        const isMatch = await bcrypt.compare(

            current_password,

            admin.password

        );

        if (!isMatch) {

            return sendError(

                res,

                "Current password is incorrect",

                [],

                400

            );

        }

        const hashedPassword = await bcrypt.hash(

            new_password,

            10

        );

        await Admin.updatePassword(

            req.user.id,

            hashedPassword

        );

        sendSuccess(

            res,

            "Password changed successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const createAdmin = async (req, res, next) => {

    try {

        if (!req.user.is_super_admin) {

            return sendError(

                res,

                "Only Super Admin can create new admins.",

                [],

                403

            );

        }

        const {

            full_name,

            email,

            phone,

            password

        } = req.body;

        if (

            !full_name ||

            !email ||

            !phone ||

            !password

        ) {

            return sendError(

                res,

                "All fields are required",

                [],

                400

            );

        }

        const emailExists = await Admin.findByEmail(email);

        if (emailExists) {

            return sendError(

                res,

                "Email already exists",

                [],

                400

            );

        }

        const phoneExists = await Admin.findByPhone(phone);

        if (phoneExists) {

            return sendError(

                res,

                "Phone number already exists",

                [],

                400

            );

        }

        const hashedPassword = await bcrypt.hash(

            password,

            10

        );

        await Admin.create({

            full_name,

            email,

            phone,

            password: hashedPassword

        });

        sendSuccess(

            res,

            "New admin created successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const getAllAdmins = async (req, res, next) => {

    try {

        if (!req.user.is_super_admin) {

            return sendError(

                res,

                "Only Super Admin can access this feature.",

                [],

                403

            );

        }

        const admins = await Admin.findAll();

        sendSuccess(

            res,

            "Admins fetched successfully",

            admins

        );

    }

    catch (error) {

        next(error);

    }

};

const getAdmin = async (req, res, next) => {

    try {

        if (!req.user.is_super_admin) {

            return sendError(

                res,

                "Only Super Admin can access this feature.",

                [],

                403

            );

        }

        const { id } = req.params;

        const admin = await Admin.findAdminById(id);

        if (!admin) {

            return sendError(

                res,

                "Admin not found",

                [],

                404

            );

        }

        sendSuccess(

            res,

            "Admin details fetched successfully",

            admin

        );

    }

    catch (error) {

        next(error);

    }

};

const updateAdmin = async (req, res, next) => {

    try {

        if (!req.user.is_super_admin) {

            return sendError(

                res,

                "Only Super Admin can access this feature.",

                [],

                403

            );

        }

        const { id } = req.params;

        const {

            full_name,

            email,

            phone,

            status

        } = req.body;

        if (

            !full_name ||

            !email ||

            !phone ||

            !status

        ) {

            return sendError(

                res,

                "All fields are required",

                [],

                400

            );

        }

        const admin = await Admin.findAdminById(id);

        if (!admin) {

            return sendError(

                res,

                "Admin not found",

                [],

                404

            );

        }

        // Prevent editing Super Admin

        if (admin.is_super_admin) {

            return sendError(

                res,

                "Super Admin cannot be edited.",

                [],

                403

            );

        }

        const emailExists = await Admin.findByEmail(email);

        if (

            emailExists &&

            emailExists.admin_id != id

        ) {

            return sendError(

                res,

                "Email already exists",

                [],

                400

            );

        }

        const phoneExists = await Admin.findByPhone(phone);

        if (

            phoneExists &&

            phoneExists.admin_id != id

        ) {

            return sendError(

                res,

                "Phone number already exists",

                [],

                400

            );

        }

        await Admin.updateAdmin(

            id,

            full_name,

            email,

            phone,

            status

        );

        sendSuccess(

            res,

            "Admin updated successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const deleteAdmin = async (req, res, next) => {

    try {

        if (!req.user.is_super_admin) {

            return sendError(

                res,

                "Only Super Admin can access this feature.",

                [],

                403

            );

        }

        const { id } = req.params;

        const admin = await Admin.findAdminById(id);

        if (!admin) {

            return sendError(

                res,

                "Admin not found",

                [],

                404

            );

        }

        // Prevent deleting Super Admin

        if (admin.is_super_admin) {

            return sendError(

                res,

                "Super Admin cannot be deleted.",

                [],

                403

            );

        }

        await Admin.deleteAdmin(id);

        sendSuccess(

            res,

            "Admin deleted successfully"

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
const getAllUsers = async (req, res, next) => {

    try {

        const users = await User.findAll();

        sendSuccess(

            res,

            "Users fetched successfully",

            users

        );

    }

    catch (error) {

        next(error);

    }

};

const searchUsers = async (req, res, next) => {

    try {

        const { keyword } = req.query;

        const users = await User.search(

            keyword || ""

        );

        sendSuccess(

            res,

            "Users fetched successfully",

            users

        );

    }

    catch (error) {

        next(error);

    }

};

const getUserDetails = async (req, res, next) => {

    try {

        const { id } = req.params;

        const user = await User.findByIdAdmin(id);

        if (!user) {

            return sendError(

                res,

                "User not found",

                [],

                404

            );

        }

        sendSuccess(

            res,

            "User fetched successfully",

            user

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
const registerLicense = async (req, res, next) => {

    try {

        const {
            license_number,
            laboratory_name,
            owner_name,
            issued_by,
            issue_date,
            expiry_date,
            status
        } = req.body;

        if (
            !license_number ||
            !laboratory_name ||
            !owner_name ||
            !issued_by ||
            !issue_date ||
            !expiry_date
        ) {

            return sendError(
                res,
                "All fields are required",
                [],
                400
            );

        }

        const existingLicense =
            await Laboratory.findLicenseNumber(license_number);

        if (existingLicense) {

            return sendError(
                res,
                "License number already exists",
                [],
                400
            );

        }

        await Laboratory.registerLicense({

            license_number,
            laboratory_name,
            owner_name,
            issued_by,
            issue_date,
            expiry_date,
            status

        });

        sendSuccess(

            res,

            "License registered successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const getAllLicenses = async (req, res, next) => {

    try {

        const licenses =
            await Laboratory.getAllLicenses();

        sendSuccess(

            res,

            "Licenses fetched successfully",

            licenses

        );

    }

    catch (error) {

        next(error);

    }

};

const getLicenseDetails = async (req, res, next) => {

    try {

        const { id } = req.params;

        const license =
            await Laboratory.getLicenseById(id);

        if (!license) {

            return sendError(

                res,

                "License not found",

                [],

                404

            );

        }

        sendSuccess(

            res,

            "License details fetched successfully",

            license

        );

    }

    catch (error) {

        next(error);

    }

};

const updateLicense = async (req, res, next) => {

    try {

        const { id } = req.params;

        const license = await Laboratory.getLicenseById(id);

        if (!license) {

            return sendError(

                res,

                "License not found",

                [],

                404

            );

        }

        await Laboratory.updateLicense(

            id,

            req.body

        );

        sendSuccess(

            res,

            "License updated successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const deleteLicense = async (req, res, next) => {

    try {

        const { id } = req.params;

        const license = await Laboratory.getLicenseById(id);

        if (!license) {

            return sendError(

                res,

                "License not found",

                [],

                404

            );

        }

        await Laboratory.deleteLicense(id);

        sendSuccess(

            res,

            "License deleted successfully"

        );

    }

    catch (error) {

        next(error);

    }

};
const getApprovedAuthorizationRequests = async (req, res, next) => {

    try {

        const authorizations =
            await ChemicalAuthorization.findApproved();

        sendSuccess(

            res,

            "Approved authorization requests fetched successfully",

            authorizations

        );

    }

    catch (error) {

        next(error);

    }

};
const getPurchaseMonitor = async (req, res, next) => {

    try {

        const purchases = await Admin.getPurchaseReport();

        sendSuccess(

            res,

            "Purchase monitor loaded successfully",

            purchases

        );

    }

    catch (error) {

        next(error);

    }

};
const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !["Active", "Inactive"].includes(status)) {
            return sendError(res, "Status must be Active or Inactive", [], 400);
        }

        const user = await User.findByIdAdmin(id);
        if (!user) {
            return sendError(res, "User not found", [], 404);
        }

        await User.updateStatus(id, status);

        sendSuccess(res, `User status updated to ${status} successfully.`);
    } catch (error) {
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

    getPurchaseReport,

    getAllUsers,

    searchUsers,

    getUserDetails,

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

    deleteAdmin,

    updateUserStatus

};