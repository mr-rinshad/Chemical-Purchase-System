const bcrypt = require("bcrypt");

const Laboratory = require("../models/Laboratory");
const ChemicalAuthorization = require("../models/ChemicalAuthorization");
const Chemical = require("../models/Chemical");
const PurchaseRequest = require("../models/PurchaseRequest");
const generateToken = require("../utils/generateToken");
const generatePurchaseCode = require("../utils/generatePurchaseCode");

const {
    sendSuccess,
    sendError
} = require("../utils/responseHandler");

// Test Controller
const testLaboratory = (req, res) => {

    sendSuccess(
        res,
        "Laboratory Controller Working"
    );

};

// Register Laboratory
const register = async (req, res, next) => {

    try {

        const {

            license_id,
            lab_name,
            email,
            password,
            phone,
            address,
            city,
            state,
            pincode

        } = req.body;

        // Required Field Validation
        if (
            !license_id ||
            !lab_name ||
            !email ||
            !password ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {

            return sendError(
                res,
                "All fields are required",
                [],
                400
            );

        }

        // Check Existing Email
        const existingLab = await Laboratory.findByEmail(email);

        if (existingLab) {

            return sendError(
                res,
                "Laboratory email already exists",
                [],
                409
            );

        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save Laboratory
        await Laboratory.create({

            license_id,
            lab_name,
            email,
            password: hashedPassword,
            phone,
            address,
            city,
            state,
            pincode

        });

        sendSuccess(

            res,

            "Laboratory registered successfully. Waiting for Admin approval."

        );

    }

    catch (error) {

        next(error);

    }

};

// Laboratory Login
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

        const laboratory = await Laboratory.findByEmail(email);

        if (!laboratory) {

            return sendError(

                res,

                "Invalid email or password",

                [],

                401

            );

        }

        if (laboratory.status === "Pending") {

            return sendError(

                res,

                "Your laboratory registration is pending Admin approval",

                [],

                403

            );

        }

        if (laboratory.status === "Rejected") {

            return sendError(

                res,

                "Your laboratory registration has been rejected",

                [],

                403

            );

        }

        if (laboratory.status === "Suspended") {

            return sendError(

                res,

                "Your laboratory account has been suspended",

                [],

                403

            );

        }

        const isMatch = await bcrypt.compare(

            password,

            laboratory.password

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

            id: laboratory.lab_id,

            email: laboratory.email,

            account_type: "laboratory"

        });

        sendSuccess(

            res,

            "Laboratory login successful",

            {

                token,

                laboratory: {

                    lab_id: laboratory.lab_id,

                    lab_name: laboratory.lab_name,

                    email: laboratory.email,

                    phone: laboratory.phone,

                    status: laboratory.status

                }

            }

        );

    }

    catch (error) {

        next(error);

    }

};

// Laboratory Profile
const getProfile = async (req, res, next) => {

    try {

        const laboratory = await Laboratory.findById(req.user.id);

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

            "Laboratory profile fetched successfully",

            laboratory

        );

    }

    catch (error) {

        next(error);

    }

};

const verifyAuthorization = async (req, res, next) => {

    try {

        const { authorization_code } = req.body;

        if (!authorization_code) {

            return sendError(

                res,

                "Authorization code is required",

                [],

                400

            );

        }

        const authorization = await ChemicalAuthorization.findByAuthorizationCode(

            authorization_code

        );

        if (!authorization) {

            return sendError(

                res,

                "Invalid authorization code",

                [],

                404

            );

        }

        if (authorization.status !== "Approved") {

            return sendError(

                res,

                `Authorization is ${authorization.status}`,

                [],

                400

            );

        }

        if (new Date() > new Date(authorization.expiry_date)) {

            await ChemicalAuthorization.expireAuthorization(

                authorization.authorization_id

            );

            return sendError(

                res,

                "Authorization has expired",

                [],

                400

            );

        }

        sendSuccess(

            res,

            "Authorization verified successfully",

            authorization

        );

    }

    catch (error) {

        next(error);

    }

};

const addChemical = async (req, res, next) => {

    try {

        const {

            chemical_code,

            chemical_name,

            formula,

            category,

            unit,

            price_per_unit,

            total_stock

        } = req.body;

        if (

            !chemical_code ||

            !chemical_name ||

            !category ||

            !unit ||

            !price_per_unit ||

            !total_stock

        ) {

            return sendError(

                res,

                "All required fields must be provided",

                [],

                400

            );

        }

        const existingChemical = await Chemical.findByCode(

            chemical_code

        );

        if (existingChemical) {

            return sendError(

                res,

                "Chemical code already exists",

                [],

                400

            );

        }

        await Chemical.create({

            lab_id: req.user.id,

            chemical_code,

            chemical_name,

            formula,

            category,

            unit,

            price_per_unit,

            total_stock

        });

        sendSuccess(

            res,

            "Chemical added successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const getMyChemicals = async (req, res, next) => {

    try {

        const chemicals = await Chemical.findByLaboratory(

            req.user.id

        );

        sendSuccess(

            res,

            "Chemicals fetched successfully",

            chemicals

        );

    }

    catch (error) {

        next(error);

    }

};

const getChemicalDetails = async (req, res, next) => {

    try {

        const { id } = req.params;

        const chemical = await Chemical.findById(id);

        if (!chemical) {

            return sendError(

                res,

                "Chemical not found",

                [],

                404

            );

        }

        if (chemical.lab_id !== req.user.id) {

            return sendError(

                res,

                "You are not authorized to access this chemical",

                [],

                403

            );

        }

        sendSuccess(

            res,

            "Chemical details fetched successfully",

            chemical

        );

    }

    catch (error) {

        next(error);

    }

};

const updateChemical = async (req, res, next) => {

    try {

        const { id } = req.params;

        const chemical = await Chemical.findById(id);

        if (!chemical) {

            return sendError(

                res,

                "Chemical not found",

                [],

                404

            );

        }

        if (chemical.lab_id !== req.user.id) {

            return sendError(

                res,

                "You are not authorized to update this chemical",

                [],

                403

            );

        }

        const {

            chemical_name,

            formula,

            category,

            unit,

            price_per_unit,

            total_stock,

            status

        } = req.body;

        await Chemical.update(

            id,

            {

                chemical_name,

                formula,

                category,

                unit,

                price_per_unit,

                total_stock,

                status

            }

        );

        sendSuccess(

            res,

            "Chemical updated successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const deleteChemical = async (req, res, next) => {

    try {

        const { id } = req.params;

        const chemical = await Chemical.findById(id);

        if (!chemical) {

            return sendError(

                res,

                "Chemical not found",

                [],

                404

            );

        }

        if (chemical.lab_id !== req.user.id) {

            return sendError(

                res,

                "You are not authorized to delete this chemical",

                [],

                403

            );

        }

        if (Number(chemical.reserved_stock) > 0) {

            return sendError(

                res,

                "Cannot delete a chemical with reserved stock",

                [],

                400

            );

        }

        await Chemical.delete(id);

        sendSuccess(

            res,

            "Chemical deleted successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const updateChemicalStock = async (req, res, next) => {

    try {

        const { id } = req.params;

        const { total_stock } = req.body;

        if (total_stock === undefined || Number(total_stock) < 0) {

            return sendError(

                res,

                "Valid stock quantity is required",

                [],

                400

            );

        }

        const chemical = await Chemical.findById(id);

        if (!chemical) {

            return sendError(

                res,

                "Chemical not found",

                [],

                404

            );

        }

        if (chemical.lab_id !== req.user.id) {

            return sendError(

                res,

                "You are not authorized to update this chemical",

                [],

                403

            );

        }

        await Chemical.updateStock(

            id,

            total_stock

        );

        sendSuccess(

            res,

            "Chemical stock updated successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const searchChemicals = async (req, res, next) => {

    try {

        const { keyword } = req.query;

        if (!keyword) {

            return sendError(

                res,

                "Search keyword is required",

                [],

                400

            );

        }

        const chemicals = await Chemical.search(

            req.user.id,

            keyword

        );

        sendSuccess(

            res,

            "Search completed successfully",

            chemicals

        );

    }

    catch (error) {

        next(error);

    }

};

const filterChemicals = async (req, res, next) => {

    try {

        const {

            category,

            status

        } = req.query;

        const chemicals = await Chemical.filter(

            req.user.id,

            category,

            status

        );

        sendSuccess(

            res,

            "Chemicals filtered successfully",

            chemicals

        );

    }

    catch (error) {

        next(error);

    }

};

const inventoryDashboard = async (req, res, next) => {

    try {

        const summary = await Chemical.getInventorySummary(

            req.user.id

        );

        sendSuccess(

            res,

            "Inventory dashboard fetched successfully",

            summary

        );

    }

    catch (error) {

        next(error);

    }

};

const getPurchaseRequests = async (req, res, next) => {

    try {

        const requests = await PurchaseRequest.getLaboratoryRequests(

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

const approvePurchaseRequest = async (req, res, next) => {

    try {

        const { id } = req.params;

        const request = await PurchaseRequest.findById(id);

        if (!request) {

            return sendError(

                res,

                "Purchase request not found",

                [],

                404

            );

        }

        if (request.lab_id !== req.user.id) {

            return sendError(

                res,

                "You are not authorized to approve this request",

                [],

                403

            );

        }

        if (request.request_status !== "Submitted") {

            return sendError(

                res,

                "Only submitted requests can be approved",

                [],

                400

            );

        }

        const authorization = await ChemicalAuthorization.findValidAuthorization(

            request.authorization_id

        );

        if (!authorization) {

            return sendError(

                res,

                "Authorization is invalid or has expired",

                [],

                400

            );

        }

        await PurchaseRequest.approve(

            id,

            req.user.id

        );

        sendSuccess(

            res,

            "Purchase request approved successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const reservePurchaseRequest = async (req, res, next) => {

    try {

        const { id } = req.params;

        const request = await PurchaseRequest.findById(id);

        if (!request) {

            return sendError(

                res,

                "Purchase request not found",

                [],

                404

            );

        }

        if (request.lab_id !== req.user.id) {

            return sendError(

                res,

                "Unauthorized request",

                [],

                403

            );

        }

        if (request.request_status !== "Approved") {

            return sendError(

                res,

                "Request must be approved first",

                [],

                400

            );

        }

        const chemical = await Chemical.findById(

            request.chemical_id

        );

        if (!chemical) {

            return sendError(

                res,

                "Chemical not found",

                [],

                404

            );

        }

        if (

            Number(chemical.total_stock)

            <

            Number(request.quantity)

        ) {

            return sendError(

                res,

                "Insufficient stock",

                [],

                400

            );

        }

        await Chemical.reserveStock(

            request.chemical_id,

            request.quantity

        );

        const purchaseCode = generatePurchaseCode();

        await PurchaseRequest.reserve(

            request.request_id,

            purchaseCode,

            process.env.RESERVATION_VALID_DAYS

        );

        sendSuccess(

            res,

            "Stock reserved successfully",

            {

                purchase_code: purchaseCode,

                reservation_days:

                    process.env.RESERVATION_VALID_DAYS

            }

        );

    }

    catch (error) {

        next(error);

    }

};
const completePurchase = async (req, res, next) => {

    try {

        const { purchase_code } = req.body;

        if (!purchase_code) {

            return sendError(

                res,

                "Purchase code is required",

                [],

                400

            );

        }

        const request = await PurchaseRequest.findByPurchaseCode(

            purchase_code

        );

        if (!request) {

            return sendError(

                res,

                "Invalid purchase code",

                [],

                404

            );

        }

        if (request.lab_id !== req.user.id) {

            return sendError(

                res,

                "Unauthorized purchase code",

                [],

                403

            );

        }

        if (request.request_status !== "Reserved") {

            return sendError(

                res,

                "Purchase has already been completed or is not reserved",

                [],

                400

            );

        }

        if (

            new Date(request.reservation_expiry)

            <

            new Date()

        ) {

            return sendError(

                res,

                "Reservation has expired",

                [],

                400

            );

        }

        await PurchaseRequest.completePurchase(

            request.request_id

        );

        await Chemical.completeReservedStock(

            request.chemical_id,

            request.quantity

        );

        sendSuccess(

            res,

            "Purchase completed successfully"

        );

    }

    catch (error) {

        next(error);

    }

};

const expireReservations = async (req, res, next) => {

    try {

        const reservations = await PurchaseRequest.getExpiredReservations();

        let expiredCount = 0;

        for (const reservation of reservations) {

            await Chemical.returnReservedStock(

                reservation.chemical_id,

                reservation.quantity

            );

            await PurchaseRequest.expireReservation(

                reservation.request_id

            );

            expiredCount++;

        }

        sendSuccess(

            res,

            `${expiredCount} reservation(s) expired successfully`

        );

    }

    catch (error) {

        next(error);

    }

};

const dashboard = async (req, res, next) => {

    try {

        const statistics = await Laboratory.getDashboardStatistics(

            req.user.id

        );

        sendSuccess(

            res,

            "Laboratory dashboard loaded successfully",

            statistics

        );

    }

    catch (error) {

        next(error);

    }

};

const getPurchaseReport = async (req, res, next) => {

    try {

        const report = await Laboratory.getPurchaseReport(

            req.user.id

        );

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


};