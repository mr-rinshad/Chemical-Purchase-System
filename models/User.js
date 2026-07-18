const db = require("../config/db");

class User {

    static async findByEmail(email) {

        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        return rows[0];

    }

    static async findByPhone(phone) {

        const [rows] = await db.query(
            "SELECT * FROM users WHERE phone = ?",
            [phone]
        );

        return rows[0];

    }

  static async findById(userId) {

    const [rows] = await db.query(

        `SELECT
            user_id,
            full_name,
            email,
            phone,
            created_at
        FROM users
        WHERE user_id = ?`,

        [userId]

    );

    return rows[0];

}
static async findByEmailExceptUser(email, userId) {

    const [rows] = await db.query(

        `SELECT user_id
         FROM users
         WHERE email = ?
         AND user_id != ?`,

        [email, userId]

    );

    return rows[0];

}

static async findByPhoneExceptUser(phone, userId) {

    const [rows] = await db.query(

        `SELECT user_id
         FROM users
         WHERE phone = ?
         AND user_id != ?`,

        [phone, userId]

    );

    return rows[0];

}

static async updateProfile(userId, data) {

    const {

        full_name,
        email,
        phone

    } = data;

    await db.query(

        `UPDATE users
         SET
            full_name=?,
            email=?,
            phone=?
         WHERE user_id=?`,

        [

            full_name,
            email,
            phone,
            userId

        ]

    );

}
static async findPasswordById(userId) {

    const [rows] = await db.query(

        `SELECT
            user_id,
            password
        FROM users
        WHERE user_id = ?`,

        [userId]

    );

    return rows[0];

}

static async updatePassword(userId, password) {

    await db.query(

        `UPDATE users
         SET password = ?
         WHERE user_id = ?`,

        [

            password,

            userId

        ]

    );

}
    static async login(email) {

        const [rows] = await db.query(

            `SELECT
                user_id,
                full_name,
                email,
                phone,
                password
            FROM users
            WHERE email = ?`,

            [email]

        );

        return rows[0];

    }

    static async create(userData) {

        const {
            full_name,
            email,
            phone,
            password
        } = userData;

        const [result] = await db.query(

            `INSERT INTO users
            (full_name,email,phone,password)
            VALUES (?,?,?,?)`,

            [
                full_name,
                email,
                phone,
                password
            ]

        );

        return result.insertId;

    }

    // User Dashboard Statistics
static async getDashboardStatistics(userId) {

    const [rows] = await db.execute(

        `SELECT

            (SELECT COUNT(*)

                FROM chemical_authorizations

                WHERE user_id = ?) AS total_authorizations,

            (SELECT COUNT(*)

                FROM chemical_authorizations

                WHERE user_id = ?

                AND status = 'Approved') AS approved_authorizations,

            (SELECT COUNT(*)

                FROM chemical_authorizations

                WHERE user_id = ?

                AND status = 'Pending') AS pending_authorizations,

            (SELECT COUNT(*)

                FROM chemical_authorizations

                WHERE user_id = ?

                AND status = 'Rejected') AS rejected_authorizations,

            (SELECT COUNT(*)

                FROM chemical_authorizations

                WHERE user_id = ?

                AND status = 'Expired') AS expired_authorizations,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE user_id = ?) AS total_purchase_requests,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE user_id = ?

                AND request_status = 'Submitted') AS pending_purchase_requests,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE user_id = ?

                AND request_status = 'Reserved') AS reserved_purchases,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE user_id = ?

                AND request_status = 'Completed') AS completed_purchases,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE user_id = ?

                AND request_status = 'Expired') AS expired_reservations`,

        [

            userId,
            userId,
            userId,
            userId,
            userId,
            userId,
            userId,
            userId,
            userId,
            userId

        ]

    );

    return rows[0];

}

// User Purchase History
static async getPurchaseHistory(userId) {

    const [rows] = await db.execute(

        `SELECT

            pr.request_id,

            l.lab_name,

            c.chemical_name,

            pr.quantity,

            c.unit,

            pr.purchase_mode,

            ca.authorization_code,

            pr.purchase_code,

            pr.request_status,

            pr.reservation_status,

            pr.request_date,

            pr.reservation_expiry,

            pr.completed_at

        FROM purchase_requests pr

        INNER JOIN laboratories l

            ON pr.lab_id = l.lab_id

        INNER JOIN chemicals c

            ON pr.chemical_id = c.chemical_id

        INNER JOIN chemical_authorizations ca

            ON pr.authorization_id = ca.authorization_id

        WHERE

            pr.user_id = ?

        ORDER BY

            pr.request_date DESC`,

        [

            userId

        ]

    );

    return rows;

}
}

module.exports = User;