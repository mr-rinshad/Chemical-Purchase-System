const bcrypt = require("bcrypt");

const Admin = require("../models/Admin");

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

module.exports = {

    testAdmin,

    login

};