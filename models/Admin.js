const db = require("../config/db");

class Admin {

    static async findByEmail(email) {

        const [rows] = await db.query(

            `SELECT *
             FROM admins
             WHERE email = ?`,

            [email]

        );

        return rows[0];

    }

}

module.exports = Admin;