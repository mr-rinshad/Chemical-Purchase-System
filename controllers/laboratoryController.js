const bcrypt = require("bcrypt");

const Laboratory = require("../models/Laboratory");
const generateToken = require("../utils/generateToken");

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

module.exports = {

    testLaboratory,

    register,

    login,

    getProfile

};