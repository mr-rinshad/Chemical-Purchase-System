const db = require("../config/db");

class PurchaseRequest {

    // Create Purchase Request
    static async create(data) {

        const {

            user_id,

            lab_id,

            chemical_id,

            authorization_id,

            quantity,

            purchase_mode

        } = data;

        const [result] = await db.execute(

            `INSERT INTO purchase_requests
            (
                user_id,
                lab_id,
                chemical_id,
                authorization_id,
                quantity,
                purchase_mode
            )
            VALUES (?, ?, ?, ?, ?, ?)`,

            [

                user_id,

                lab_id,

                chemical_id,

                authorization_id,

                quantity,

                purchase_mode

            ]

        );

        return result.insertId;

    }

    // Find Purchase Request By ID
    static async findById(requestId) {

        const [rows] = await db.execute(

            `SELECT *
             FROM purchase_requests
             WHERE request_id = ?`,

            [requestId]

        );

        return rows[0];

    }

    // Get User Purchase Requests
static async getUserRequests(userId) {

    const [rows] = await db.execute(

        `SELECT

            pr.request_id,

            l.lab_name,

            c.chemical_name,

            pr.quantity,

            c.unit,

            pr.purchase_mode,

            pr.request_status,

            pr.request_date

        FROM purchase_requests pr

        INNER JOIN laboratories l
            ON pr.lab_id = l.lab_id

        INNER JOIN chemicals c
            ON pr.chemical_id = c.chemical_id

        WHERE pr.user_id = ?

        ORDER BY pr.request_date DESC`,

        [userId]

    );

    return rows;

}

// Get Laboratory Purchase Requests
static async getLaboratoryRequests(labId) {

    const [rows] = await db.execute(

        `SELECT

            pr.request_id,

            u.full_name,

            u.email,

            u.phone,

            ca.authorization_code,

            ca.purpose,

            ca.expiry_date,

            c.chemical_name,

            c.formula,

            c.unit,

            pr.quantity,

            pr.purchase_mode,

            pr.request_status,

            pr.purchase_code,

            pr.request_date

        FROM purchase_requests pr

        INNER JOIN users u
            ON pr.user_id = u.user_id

        INNER JOIN chemicals c
            ON pr.chemical_id = c.chemical_id

        INNER JOIN chemical_authorizations ca
            ON pr.authorization_id = ca.authorization_id

        WHERE pr.lab_id = ?

        ORDER BY pr.request_date DESC`,

        [labId]

    );

    return rows;

}
// Approve Purchase Request
static async approve(requestId, labId) {

    const [result] = await db.execute(

        `UPDATE purchase_requests

        SET

            request_status = 'Approved',

            verified_at = NOW()

        WHERE

            request_id = ?

        AND

            lab_id = ?`,

        [

            requestId,

            labId

        ]

    );

    return result.affectedRows;

}

// Reserve Purchase Request
static async reserve(

    requestId,

    purchaseCode,

    reservationDays

) {

    const [result] = await db.execute(

        `UPDATE purchase_requests

        SET

            purchase_code = ?,

            reservation_start = NOW(),

            reservation_expiry = DATE_ADD(

                NOW(),

                INTERVAL ? DAY

            ),

            reservation_status = 'Reserved',

            request_status = 'Reserved'

        WHERE

            request_id = ?`,

        [

            purchaseCode,

            reservationDays,

            requestId

        ]

    );

    return result.affectedRows;

}

// Get Purchase Code Details
static async getPurchaseCode(requestId, userId) {

    const [rows] = await db.execute(

        `SELECT

            pr.request_id,

            pr.purchase_code,

            l.lab_name,

            c.chemical_name,

            pr.quantity,

            c.unit,

            pr.request_status,

            pr.reservation_status,

            pr.reservation_start,

            pr.reservation_expiry

        FROM purchase_requests pr

        INNER JOIN laboratories l

            ON pr.lab_id = l.lab_id

        INNER JOIN chemicals c

            ON pr.chemical_id = c.chemical_id

        WHERE

            pr.request_id = ?

        AND

            pr.user_id = ?`,

        [

            requestId,

            userId

        ]

    );

    return rows[0];

}

// Find Purchase Code
static async findByPurchaseCode(purchaseCode) {

    const [rows] = await db.execute(

        `SELECT *

        FROM purchase_requests

        WHERE purchase_code = ?`,

        [purchaseCode]

    );

    return rows[0];

}
// Complete Purchase
static async completePurchase(requestId) {

    const [result] = await db.execute(

        `UPDATE purchase_requests

        SET

            request_status = 'Completed',

            reservation_status = 'Released',

            completed_at = NOW()

        WHERE request_id = ?`,

        [requestId]

    );

    return result.affectedRows;

}

// Get Expired Reservations
static async getExpiredReservations() {

    const [rows] = await db.execute(

        `SELECT *

        FROM purchase_requests

        WHERE

            reservation_status = 'Reserved'

        AND

            reservation_expiry <= NOW()`

    );

    return rows;

}

// Expire Reservation
static async expireReservation(requestId) {

    const [result] = await db.execute(

        `UPDATE purchase_requests

        SET

            reservation_status = 'Expired',

            request_status = 'Expired'

        WHERE request_id = ?`,

        [requestId]

    );

    return result.affectedRows;

}
}

module.exports = PurchaseRequest;