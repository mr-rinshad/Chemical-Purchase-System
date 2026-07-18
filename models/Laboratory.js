const db = require("../config/db");

class Laboratory {

    // Check whether email already exists
   static async findByEmail(email) {

    const [rows] = await db.execute(

        `SELECT *
         FROM laboratories
         WHERE email = ?`,

        [email]

    );

    return rows[0];

}
// Find Laboratory by ID
static async findById(id) {

    const [rows] = await db.execute(

        `SELECT
            lab_id,
            license_id,
            lab_name,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            status,
            created_at,
            updated_at
         FROM laboratories
         WHERE lab_id = ?`,

        [id]

    );

    return rows[0];

}

    // Register a new laboratory
    static async create(data) {

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

        } = data;

        const [result] = await db.execute(

            `INSERT INTO laboratories
            (
                license_id,
                lab_name,
                email,
                password,
                phone,
                address,
                city,
                state,
                pincode
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [
                license_id,
                lab_name,
                email,
                password,
                phone,
                address,
                city,
                state,
                pincode
            ]

        );

        return result;

    }
    // Get All Laboratories
static async findAll() {

    const [rows] = await db.execute(

        `SELECT
            lab_id,
            license_id,
            lab_name,
            email,
            phone,
            city,
            state,
            status,
            created_at
         FROM laboratories
         ORDER BY created_at DESC`

    );

    return rows;

 }
 // Get All Pending Laboratories
static async findPending() {

    const [rows] = await db.execute(

        `SELECT
            lab_id,
            license_id,
            lab_name,
            email,
            phone,
            city,
            state,
            status,
            created_at
         FROM laboratories
         WHERE status = 'Pending'
         ORDER BY created_at DESC`

    );

    return rows;

}
// Get Laboratory Details by ID
static async findByLabId(labId) {

    const [rows] = await db.execute(

        `SELECT
            lab_id,
            license_id,
            lab_name,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            status,
            created_at,
            updated_at
         FROM laboratories
         WHERE lab_id = ?`,

        [labId]

    );

    return rows[0];

}

// Approve Laboratory
static async approveLab(labId) {

    const [result] = await db.execute(

        `UPDATE laboratories
         SET status = 'Approved'
         WHERE lab_id = ?`,

        [labId]

    );

    return result;

}

// Reject Laboratory
static async rejectLab(labId, reason) {

    const [result] = await db.execute(

        `UPDATE laboratories
         SET
            status = 'Rejected',
            rejection_reason = ?
         WHERE lab_id = ?`,

        [

            reason,

            labId

        ]

    );

    return result;

}

// Suspend Laboratory
static async suspendLab(labId) {

    const [result] = await db.execute(

        `UPDATE laboratories
         SET status = 'Suspended'
         WHERE lab_id = ?`,

        [labId]

    );

    return result;

}

// Reactivate Laboratory
static async reactivateLab(labId) {

    const [result] = await db.execute(

        `UPDATE laboratories
         SET status = 'Approved'
         WHERE lab_id = ?`,

        [labId]

    );

    return result;

}

// Get Approved Laboratories
static async getApprovedLaboratories() {

    const [rows] = await db.execute(

        `SELECT

            lab_id,

            lab_name,

            email,

            phone,

            address,

            city,

            state,

            pincode

        FROM laboratories

        WHERE status = 'Approved'

        ORDER BY lab_name ASC`

    );

    return rows;

}

// Find Approved Laboratory
static async findApprovedById(labId) {

    const [rows] = await db.execute(

        `SELECT *

        FROM laboratories

        WHERE lab_id = ?

        AND status = 'Approved'`,

        [

            labId

        ]

    );

    return rows[0];

}

// Laboratory Dashboard Statistics
static async getDashboardStatistics(labId) {

    const [rows] = await db.execute(

        `SELECT

            (SELECT COUNT(*)

                FROM chemicals

                WHERE lab_id = ?) AS total_chemicals,

            (SELECT COUNT(*)

                FROM chemicals

                WHERE lab_id = ?

                AND status = 'Available') AS available_chemicals,

            (SELECT COUNT(*)

                FROM chemicals

                WHERE lab_id = ?

                AND status = 'Out of Stock') AS out_of_stock,

            (SELECT IFNULL(SUM(total_stock),0)

                FROM chemicals

                WHERE lab_id = ?) AS total_stock,

            (SELECT IFNULL(SUM(reserved_stock),0)

                FROM chemicals

                WHERE lab_id = ?) AS reserved_stock,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE lab_id = ?

                AND request_status = 'Submitted') AS pending_requests,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE lab_id = ?

                AND request_status = 'Approved') AS approved_requests,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE lab_id = ?

                AND request_status = 'Reserved') AS reserved_requests,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE lab_id = ?

                AND request_status = 'Completed') AS completed_purchases,

            (SELECT COUNT(*)

                FROM purchase_requests

                WHERE lab_id = ?

                AND request_status = 'Expired') AS expired_reservations`,

        [

            labId,
            labId,
            labId,
            labId,
            labId,
            labId,
            labId,
            labId,
            labId,
            labId

        ]

    );

    return rows[0];

}
// Laboratory Purchase Report
static async getPurchaseReport(labId) {

    const [rows] = await db.execute(

        `SELECT

            pr.request_id,

            u.full_name AS user_name,

            c.chemical_name,

            pr.quantity,

            c.unit,

            pr.purchase_mode,

            pr.purchase_code,

            pr.request_status,

            pr.reservation_status,

            pr.request_date,

            pr.completed_at

        FROM purchase_requests pr

        INNER JOIN users u

            ON pr.user_id = u.user_id

        INNER JOIN chemicals c

            ON pr.chemical_id = c.chemical_id

        WHERE

            pr.lab_id = ?

        ORDER BY

            pr.request_date DESC`,

        [

            labId

        ]

    );

    return rows;

}
}

module.exports = Laboratory;