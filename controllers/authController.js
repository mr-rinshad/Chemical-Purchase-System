const bcrypt = require("bcrypt");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ChemicalAuthorization = require("../models/ChemicalAuthorization");
const generateAuthorizationCode = require("../utils/generateAuthorizationCode");

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

module.exports = {

    testAuth,

    register,

    login,

    profile,

    updateProfile,

    changePassword,

    requestAuthorization,

    getMyAuthorizationRequests

};