const db = require("../config/db");

class Admin {

    static async findByEmail(email) {

    const [rows] = await db.execute(

        `SELECT

            admin_id,

            full_name,

            email,

            password,

            phone,

            designation,

            status,

            is_super_admin

        FROM admins

        WHERE email = ?`,

        [email]

    );

    return rows[0];

}

    // Get Admin Profile
static async findById(id) {

    const [rows] = await db.execute(

        `SELECT

            admin_id,

            full_name,

            email,

            phone,

            designation,

            status,

            is_super_admin,

            created_at,

            updated_at

        FROM admins

        WHERE admin_id = ?`,

        [id]

    );

    return rows[0];

}

// Find Admin By Email Except Current Admin
static async findByEmailExceptAdmin(email, adminId) {

    const [rows] = await db.execute(

        `SELECT admin_id

         FROM admins

         WHERE email = ?

         AND admin_id != ?`,

        [

            email,

            adminId

        ]

    );

    return rows[0];

}

// Update Admin Profile
static async updateProfile(adminId, fullName, phone) {

    const [result] = await db.execute(

        `UPDATE admins

         SET

            full_name = ?,

            phone = ?

         WHERE admin_id = ?`,

        [

            fullName,

            phone,

            adminId

        ]

    );

    return result;

}

// Get Admin Password
static async findPasswordById(adminId) {

    const [rows] = await db.execute(

        `SELECT password

         FROM admins

         WHERE admin_id = ?`,

        [adminId]

    );

    return rows[0];

}

// Update Password
static async updatePassword(adminId, password) {

    const [result] = await db.execute(

        `UPDATE admins

         SET password = ?

         WHERE admin_id = ?`,

        [

            password,

            adminId

        ]

    );

    return result;

}

// Create New Admin
static async create(data) {

    const [result] = await db.execute(

        `INSERT INTO admins (

            full_name,

            email,

            password,

            phone

        )

        VALUES (?, ?, ?, ?)`,

        [

            data.full_name,

            data.email,

            data.password,

            data.phone

        ]

    );

    return result;

}

// Find Admin By Phone
static async findByPhone(phone) {

    const [rows] = await db.execute(

        `SELECT *

         FROM admins

         WHERE phone = ?`,

        [phone]

    );

    return rows[0];

}


// Get All Admins
static async findAll() {

    const [rows] = await db.execute(

        `SELECT

            admin_id,
            full_name,
            email,
            phone,
            designation,
            status,
            is_super_admin,
            created_at

         FROM admins

         ORDER BY admin_id ASC`

    );

    return rows;

}

// Get Admin Details
static async findAdminById(adminId) {

    const [rows] = await db.execute(

        `SELECT

            admin_id,
            full_name,
            email,
            phone,
            designation,
            status,
            is_super_admin,
            created_at,
            updated_at

         FROM admins

         WHERE admin_id = ?`,

        [adminId]

    );

    return rows[0];

}

// Update Admin
static async updateAdmin(

    adminId,

    full_name,

    email,

    phone,

    status

) {

    const [result] = await db.execute(

        `UPDATE admins

         SET

            full_name = ?,
            email = ?,
            phone = ?,
            status = ?

         WHERE admin_id = ?`,

        [

            full_name,

            email,

            phone,

            status,

            adminId

        ]

    );

    return result;

}

// Delete Admin
static async deleteAdmin(adminId) {

    const [result] = await db.execute(

        `DELETE

         FROM admins

         WHERE admin_id = ?`,

        [adminId]

    );

    return result;

}





    // Dashboard Statistics
static async getDashboardStatistics() {

    const [rows] = await db.execute(

        `SELECT

            (SELECT COUNT(*) FROM users) AS total_users,

            (SELECT COUNT(*) FROM laboratories) AS total_laboratories,

            (SELECT COUNT(*) FROM laboratories
                WHERE status = 'Pending') AS pending_laboratories,

            (SELECT COUNT(*) FROM laboratories
                WHERE status = 'Approved') AS approved_laboratories,

            (SELECT COUNT(*) FROM chemical_authorizations
                WHERE status = 'Pending') AS pending_authorizations,

            (SELECT COUNT(*) FROM chemical_authorizations
                WHERE status = 'Approved') AS approved_authorizations,

            (SELECT COUNT(*) FROM chemicals) AS total_chemicals,

            (SELECT COUNT(*) FROM purchase_requests)
                AS total_purchase_requests,

            (SELECT COUNT(*) FROM purchase_requests
                WHERE request_status = 'Completed')
                AS completed_purchases,

            (SELECT COUNT(*) FROM purchase_requests
                WHERE reservation_status = 'Expired')
                AS expired_reservations`

    );

    return rows[0];

}

// Purchase Request Report
static async getPurchaseReport() {

    const [rows] = await db.execute(

        `SELECT

            pr.request_id,

            u.full_name AS user_name,

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

            pr.completed_at

        FROM purchase_requests pr

        INNER JOIN users u

            ON pr.user_id = u.user_id

        INNER JOIN laboratories l

            ON pr.lab_id = l.lab_id

        INNER JOIN chemicals c

            ON pr.chemical_id = c.chemical_id

        INNER JOIN chemical_authorizations ca

            ON pr.authorization_id = ca.authorization_id

        ORDER BY pr.request_date DESC`

    );

    return rows;

}
}

module.exports = Admin;