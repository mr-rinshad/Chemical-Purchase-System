const db = require("../config/db");

class Chemical {

    // Add Chemical
    static async create(data) {

        const {

            lab_id,

            chemical_code,

            chemical_name,

            formula,

            category,

            unit,

            price_per_unit,

            total_stock

        } = data;

        const [result] = await db.execute(

            `INSERT INTO chemicals
            (
                lab_id,
                chemical_code,
                chemical_name,
                formula,
                category,
                unit,
                price_per_unit,
                total_stock
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)`,

            [

                lab_id,

                chemical_code,

                chemical_name,

                formula,

                category,

                unit,

                price_per_unit,

                total_stock

            ]

        );

        return result;

    }

    // Get All Chemicals of One Laboratory
static async findByLaboratory(labId) {

    const [rows] = await db.execute(

        `SELECT *
        FROM chemicals
        WHERE lab_id = ?
        ORDER BY chemical_name ASC`,

        [labId]

    );

    return rows;

}
// Find Chemical by ID
static async findById(chemicalId) {

    const [rows] = await db.execute(

        `SELECT *
        FROM chemicals
        WHERE chemical_id = ?`,

        [chemicalId]

    );

    return rows[0];

}

// Find Chemical by Code
static async findByCode(code) {

    const [rows] = await db.execute(

        `SELECT *
        FROM chemicals
        WHERE chemical_code = ?`,

        [code]

    );

    return rows[0];

}

// Update Chemical
static async update(chemicalId, data) {

    const {

        chemical_name,

        formula,

        category,

        unit,

        price_per_unit,

        total_stock,

        status

    } = data;

    const [result] = await db.execute(

        `UPDATE chemicals
        SET
            chemical_name = ?,
            formula = ?,
            category = ?,
            unit = ?,
            price_per_unit = ?,
            total_stock = ?,
            status = ?
        WHERE chemical_id = ?`,

        [

            chemical_name,

            formula,

            category,

            unit,

            price_per_unit,

            total_stock,

            status,

            chemicalId

        ]

    );

    return result;

}

// Delete Chemical
static async delete(chemicalId) {

    const [result] = await db.execute(

        `DELETE FROM chemicals
        WHERE chemical_id = ?`,

        [chemicalId]

    );

    return result;

}

// Update Stock
static async updateStock(chemicalId, stock) {

    const [result] = await db.execute(

        `UPDATE chemicals
        SET total_stock = ?
        WHERE chemical_id = ?`,

        [

            stock,

            chemicalId

        ]

    );

    return result;

}

// Search Chemicals
static async search(labId, keyword) {

    const [rows] = await db.execute(

        `SELECT *
        FROM chemicals
        WHERE lab_id = ?
        AND
        (
            chemical_name LIKE ?
            OR chemical_code LIKE ?
        )
        ORDER BY chemical_name ASC`,

        [

            labId,

            `%${keyword}%`,

            `%${keyword}%`

        ]

    );

    return rows;

}

// Filter Chemicals
static async filter(labId, category, status) {

    let query = `
        SELECT *
        FROM chemicals
        WHERE lab_id = ?
    `;

    const params = [labId];

    if (category) {

        query += " AND category = ?";

        params.push(category);

    }

    if (status) {

        query += " AND status = ?";

        params.push(status);

    }

    query += " ORDER BY chemical_name ASC";

    const [rows] = await db.execute(

        query,

        params

    );

    return rows;

}

// Inventory Dashboard
static async getInventorySummary(labId) {

    const [rows] = await db.execute(

        `SELECT

            COUNT(*) AS total_chemicals,

            COALESCE(SUM(total_stock), 0) AS total_stock,

            SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available_chemicals,

            SUM(CASE WHEN status = 'Out of Stock' THEN 1 ELSE 0 END) AS out_of_stock_chemicals,

            SUM(CASE WHEN total_stock <= 10 THEN 1 ELSE 0 END) AS low_stock_chemicals

        FROM chemicals

        WHERE lab_id = ?`,

        [labId]

    );

    return rows[0];

}

}

module.exports = Chemical;