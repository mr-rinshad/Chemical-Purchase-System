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

}

module.exports = Laboratory;