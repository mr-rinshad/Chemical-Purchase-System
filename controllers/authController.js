const bcrypt = require("bcrypt");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ChemicalAuthorization = require("../models/ChemicalAuthorization");
const generateAuthorizationCode = require("../utils/generateAuthorizationCode");
const Laboratory = require("../models/Laboratory");
const Chemical = require("../models/Chemical");
const PurchaseRequest = require("../models/PurchaseRequest");

const {
    sendSuccess,
    sendError
} = require("../utils/responseHandler");

const testAuth = (req, res) => {

    sendSuccess(
        res,
        "Authentication Controller Working"
    );

};

const register = async (req, res, next) => {

    try {

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

        const emailExists =
            await User.findByEmail(email);

        if (emailExists) {

            return sendError(
                res,
                "Email already exists",
                [],
                400
            );

        }

        const phoneExists =
            await User.findByPhone(phone);

        if (phoneExists) {

            return sendError(
                res,
                "Phone number already exists",
                [],
                400
            );

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const userId =
            await User.create({

                full_name,
                email,
                phone,
                password: hashedPassword

            });

        sendSuccess(

            res,

            "User registered successfully",

            {
                user_id: userId
            },

            201

        );

    }

    catch (error) {

        next(error);

    }

};
// Login Controller
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

        const user = await User.login(email);

        if (!user) {

            return sendError(

                res,

                "Invalid email or password",

                [],

                401

            );

        }

        const isMatch = await bcrypt.compare(

            password,

            user.password

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

            id: user.user_id,

            email: user.email,

            account_type: "user"

        });

        delete user.password;

        sendSuccess(

            res,

            "Login successful",

            {

                token,

                user

            }

        );

    }

    catch (error) {

        next(error);

    }

};
const profile = async (req, res, next) => {

    try {

        const user = await User.findById(
            req.user.user_id
        );

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

            "Profile fetched successfully",

            user

        );

    }

    catch (error) {

        next(error);

    }

};

const updateProfile = async (req, res, next) => {

    try {

        const userId = req.user.user_id;

        const {

            full_name,
            email,
            phone

        } = req.body;

        if (

            !full_name ||

            !email ||

            !phone

        ) {

            return sendError(

                res,

                "All fields are required",

                [],

                400

            );

        }

        const emailExists =
            await User.findByEmailExceptUser(

                email,

                userId

            );

        if (emailExists) {

            return sendError(

                res,

                "Email already exists",

                [],

                400

            );

        }

        const phoneExists =
            await User.findByPhoneExceptUser(

                phone,

                userId

            );

        if (phoneExists) {

            return sendError(

                res,

                "Phone number already exists",

                [],

                400

            );

        }

        await User.updateProfile(

            userId,

            {

                full_name,
                email,
                phone

            }

        );

        const updatedUser =
            await User.findById(userId);

        sendSuccess(

            res,

            "Profile updated successfully",

            updatedUser

        );

    }

    catch (error) {

        next(error);

    }

};
const changePassword = async (req, res, next) => {

    try {

        const userId = req.user.user_id;

        const {

            current_password,

            new_password

        } = req.body;

        if (

            !current_password ||

            !new_password

        ) {

            return sendError(

                res,

                "Current password and new password are required",

                [],

                400

            );

        }

        const user = await User.findPasswordById(userId);

        if (!user) {

            return sendError(

                res,

                "User not found",

                [],

                404

            );

        }

        const isMatch = await bcrypt.compare(

            current_password,

            user.password

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

        await User.updatePassword(

            userId,

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

const requestAuthorization = async (req, res, next) => {

    try {

        const {

            purpose,

            proof_document

        } = req.body;

        if (!purpose || !proof_document) {

            return sendError(

                res,

                "Purpose and proof document are required",

                [],

                400

            );

        }

        const authorization_code = generateAuthorizationCode();

        await ChemicalAuthorization.create({

            user_id: req.user.id,

            authorization_code,

            purpose,

            proof_document

        });

        sendSuccess(

            res,

            "Authorization request submitted successfully",

            {

                authorization_code,

                status: "Pending"

            }

        );

    }

    catch (error) {

        next(error);

    }

};

const getMyAuthorizationRequests = async (req, res, next) => {

    try {

        const authorizations = await ChemicalAuthorization.findByUserId(

            req.user.id

        );

        sendSuccess(

            res,

            "Authorization requests fetched successfully",

            authorizations

        );

    }

    catch (error) {

        next(error);

    }

};

const getApprovedLaboratories = async (req, res, next) => {

    try {

        const laboratories = await Laboratory.getApprovedLaboratories();

        sendSuccess(

            res,

            "Approved laboratories fetched successfully",

            laboratories

        );

    }

    catch (error) {

        next(error);

    }

};

const getLaboratoryChemicals = async (req, res, next) => {

    try {

        const { labId } = req.params;

        const chemicals = await Chemical.getAvailableByLaboratory(

            labId

        );

        sendSuccess(

            res,

            "Laboratory chemicals fetched successfully",

            chemicals

        );

    }

    catch (error) {

        next(error);

    }

};

const submitPurchaseRequest = async (req, res, next) => {

    try {

        const {

            authorization_id,

            lab_id,

            chemical_id,

            quantity,

            purchase_mode

        } = req.body;

        if (!quantity) {

            return sendError(

                res,

                "Quantity is required",

                [],

                400

            );

        }

        if (Number(quantity) <= 0) {

            return sendError(

                res,

                "Quantity must be greater than zero",

                [],

                400

            );

        }

        if (

            !authorization_id ||

            !lab_id ||

            !chemical_id ||

            !purchase_mode

        ) {

            return sendError(

                res,

                "All fields are required",

                [],

                400

            );

        }

        const authorization = await ChemicalAuthorization.findApprovedById(

            authorization_id,

            req.user.id

        );

        if (!authorization) {

            return sendError(

                res,

                "Valid authorization not found",

                [],

                404

            );

        }

        const laboratory = await Laboratory.findApprovedById(

            lab_id

        );

        if (!laboratory) {

            return sendError(

                res,

                "Laboratory not found",

                [],

                404

            );

        }

        const chemical = await Chemical.findAvailableChemical(

            chemical_id,

            lab_id

        );

        if (!chemical) {

            return sendError(

                res,

                "Chemical not found",

                [],

                404

            );

        }

        if (Number(quantity) > Number(chemical.total_stock)) {

            return sendError(

                res,

                "Insufficient stock available",

                [],

                400

            );

        }

        const requestId = await PurchaseRequest.create({

            user_id: req.user.id,

            lab_id,

            chemical_id,

            authorization_id,

            quantity,

            purchase_mode

        });

        sendSuccess(

            res,

            "Purchase request submitted successfully",

            {

                request_id: requestId,

                status: "Submitted"

            }

        );

    }

    catch (error) {

        next(error);

    }

};

const getMyPurchaseRequests = async (req, res, next) => {

    try {

        const requests = await PurchaseRequest.getUserRequests(

            req.user.id

        );

        sendSuccess(

            res,

            "Purchase requests fetched successfully",

            requests

        );

    }

    catch (error) {

        next(error);

    }

};
const getPurchaseCode = async (req, res, next) => {

    try {

        const { id } = req.params;

        const request = await PurchaseRequest.getPurchaseCode(

            id,

            req.user.id

        );

        if (!request) {

            return sendError(

                res,

                "Purchase request not found",

                [],

                404

            );

        }

        if (!request.purchase_code) {

            return sendError(

                res,

                "Purchase code has not been generated yet",

                [],

                400

            );

        }

        sendSuccess(

            res,

            "Purchase code fetched successfully",

            request

        );

    }

    catch (error) {

        next(error);

    }

};

const dashboard = async (req, res, next) => {

    try {

        const statistics = await User.getDashboardStatistics(

            req.user.id

        );

        sendSuccess(

            res,

            "User dashboard loaded successfully",

            statistics

        );

    }

    catch (error) {

        next(error);

    }

};
const getPurchaseHistory = async (req, res, next) => {

    try {

        const history = await User.getPurchaseHistory(

            req.user.id

        );

        sendSuccess(

            res,

            "Purchase history fetched successfully",

            history

        );

    }

    catch (error) {

        next(error);

    }

};

module.exports = {

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

    getPurchaseCode,

    dashboard,

    getPurchaseHistory

};