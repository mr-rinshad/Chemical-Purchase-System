const db = require("../config/db");

class ChemicalAuthorization {

    // Create Authorization Request
static async create(data) {

    const {

        user_id,

        authorization_code,

        purpose,

        proof_document

    } = data;

    const [result] = await db.execute(

        `INSERT INTO chemical_authorizations
        (
            user_id,
            authorization_code,
            purpose,
            proof_document
        )
        VALUES (?, ?, ?, ?)`,

        [

            user_id,

            authorization_code,

            purpose,

            proof_document

        ]

    );

    return result;

}

// Get Authorizations by User
static async findByUserId(userId) {

    const [rows] = await db.execute(

        `SELECT
            authorization_id,
            authorization_code,
            purpose,
            proof_document,
            status,
            rejection_reason,
            issue_date,
            expiry_date,
            created_at
         FROM chemical_authorizations
         WHERE user_id = ?
         ORDER BY authorization_id DESC`,

        [userId]

    );

    return rows;

}
// Find Authorization by Code
static async findByAuthorizationCode(code) {

    const [rows] = await db.execute(

        `SELECT

            ca.authorization_id,

            ca.authorization_code,

            ca.status,

            ca.issue_date,

            ca.expiry_date,

            ca.purpose,

            u.user_id,

            u.full_name,

            u.email,

            u.phone

        FROM chemical_authorizations ca

        INNER JOIN users u

            ON ca.user_id = u.user_id

        WHERE ca.authorization_code = ?`,

        [code]

    );

    return rows[0];

}

// Get All Pending Authorization Requests
static async findPending() {

    const [rows] = await db.execute(

        `SELECT

            ca.authorization_id,

            ca.authorization_code,

            ca.user_id,

            u.full_name,

            u.email,

            u.phone,

            ca.purpose,

            ca.proof_document,

            ca.status,

            ca.created_at

        FROM chemical_authorizations ca

        INNER JOIN users u

            ON ca.user_id = u.user_id

        WHERE ca.status = 'Pending'

        ORDER BY ca.created_at ASC`

    );

    return rows;

}

// Approve Authorization Request
static async approve(authorizationId) {

    const [result] = await db.execute(

        `UPDATE chemical_authorizations
         SET
            status = 'Approved',
            issue_date = NOW(),
            expiry_date = DATE_ADD(NOW(), INTERVAL 2 DAY),
            rejection_reason = NULL
         WHERE authorization_id = ?`,

        [authorizationId]

    );

    return result;

}

// Expire Authorization
static async expireAuthorization(authorizationId) {

    const [result] = await db.execute(

        `UPDATE chemical_authorizations
         SET status = 'Expired'
         WHERE authorization_id = ?`,

        [authorizationId]

    );

    return result;

}

// Find Authorization by ID
static async findById(authorizationId) {

    const [rows] = await db.execute(

        `SELECT *
         FROM chemical_authorizations
         WHERE authorization_id = ?`,

        [authorizationId]

    );

    return rows[0];

}

// Reject Authorization Request
static async reject(authorizationId, reason) {

    const [result] = await db.execute(

        `UPDATE chemical_authorizations
         SET
            status = 'Rejected',
            rejection_reason = ?,
            issue_date = NULL,
            expiry_date = NULL
         WHERE authorization_id = ?`,

        [

            reason,

            authorizationId

        ]

    );

    return result;

}
}

module.exports = ChemicalAuthorization;