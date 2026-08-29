const db = require("../config/db");
const Chemical = require("./Chemical");

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

            u.full_name,

            u.address,

            l.lab_name,

            c.chemical_name,

            c.unit,

            c.price_per_unit,

            (c.price_per_unit * pr.quantity) AS total_price,

            pr.quantity,

            pr.purchase_mode,

            ca.authorization_code,

            pr.purchase_code,

            pr.payment_date,

            pr.request_status,

            pr.reservation_status,

            pr.reservation_expiry,

            pr.request_date

        FROM purchase_requests pr

        INNER JOIN users u
            ON pr.user_id = u.user_id

        INNER JOIN laboratories l
            ON pr.lab_id = l.lab_id

        INNER JOIN chemicals c
            ON pr.chemical_id = c.chemical_id

        INNER JOIN chemical_authorizations ca
            ON pr.authorization_id = ca.authorization_id

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

            c.price_per_unit,

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

// Get Expired Unpaid Reservations (NEVER returns Paid or Completed orders)
static async getExpiredReservations() {

    const [rows] = await db.execute(

        `SELECT *

        FROM purchase_requests

        WHERE

            reservation_status = 'Reserved'

        AND

            request_status NOT IN ('Paid', 'Completed')

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

        WHERE request_id = ?

        AND request_status NOT IN ('Paid', 'Completed')`,

        [requestId]

    );

    return result.affectedRows;

}

// Auto-Expire Unpaid Reservations and Return Reserved Stock to Inventory
static async expireUnpaidReservations() {

    const reservations = await this.getExpiredReservations();

    let expiredCount = 0;

    for (const reservation of reservations) {

        await Chemical.returnReservedStock(

            reservation.chemical_id,

            reservation.quantity

        );

        await this.expireReservation(

            reservation.request_id

        );

        expiredCount++;

    }

    return expiredCount;

}

// Mark Online Purchase as Paid
static async markAsPaid(purchaseCode, userId) {

    const [result] = await db.execute(

        `UPDATE purchase_requests

        SET

            request_status = 'Paid',

            payment_date = NOW()

        WHERE

            purchase_code = ?

        AND

            user_id = ?`,

        [

            purchaseCode,

            userId

        ]

    );

    return result.affectedRows > 0;

}

static async completeOnlineOrder(requestId, userId = null) {

    let query = `SELECT * FROM purchase_requests WHERE request_id = ?`;
    const params = [requestId];
    if (userId) {
        query += ` AND user_id = ?`;
        params.push(userId);
    }

    const [rows] = await db.execute(query, params);
    if (!rows || rows.length === 0) return false;

    const request = rows[0];

    // Complete the reserved stock if still active
    if (request.reservation_status === 'Reserved') {
        await Chemical.completeReservedStock(request.chemical_id, request.quantity);
    }

    const [result] = await db.execute(

        `UPDATE purchase_requests

        SET

            request_status = 'Completed',

            reservation_status = 'Released',

            completed_at = NOW()

        WHERE

            request_id = ?`,

        [requestId]

    );

    return result.affectedRows > 0;

}

// Auto-complete all online orders where 2 days have passed since payment
static async autoCompleteOrders(userId = null) {

    let query = `
        SELECT request_id, chemical_id, quantity, user_id, reservation_status, purchase_code
        FROM purchase_requests
        WHERE
            (
                (request_status = 'Paid' AND payment_date IS NOT NULL AND payment_date <= DATE_SUB(NOW(), INTERVAL 2 DAY))
                OR
                (purchase_mode = 'Online' AND request_status = 'Expired' AND payment_date IS NOT NULL AND payment_date <= DATE_SUB(NOW(), INTERVAL 2 DAY))
            )
    `;

    const params = [];
    if (userId) {
        query += ` AND user_id = ?`;
        params.push(userId);
    }

    const [eligibleOrders] = await db.execute(query, params);
    let completedCount = 0;

    for (const order of eligibleOrders) {
        // If still reserved, finalize from reserved stock
        if (order.reservation_status === 'Reserved') {
            await Chemical.completeReservedStock(order.chemical_id, order.quantity);
        } else if (order.reservation_status === 'Expired') {
            // If it was wrongly marked Expired and returned to total_stock by the previous bug,
            // re-deduct the quantity from total_stock to balance inventory
            await db.execute(
                `UPDATE chemicals
                SET total_stock = GREATEST(0, total_stock - ?)
                WHERE chemical_id = ?`,
                [order.quantity, order.chemical_id]
            );
        }

        await db.execute(
            `UPDATE purchase_requests
            SET
                request_status = 'Completed',
                reservation_status = 'Released',
                completed_at = COALESCE(completed_at, NOW())
            WHERE request_id = ?`,
            [order.request_id]
        );
        completedCount++;
    }

    return completedCount;

}

}

module.exports = PurchaseRequest;