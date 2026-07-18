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