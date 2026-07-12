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

}

module.exports = User;