import pool from '../db/pool.js';

export const getMyProperties = async (req, res, next) => {
    const ownerId = req.user.id;

    const { rows } = await pool.query(`
        SELECT
            p.*,
            c.name AS city_name
        FROM properties p
        JOIN cities c ON p.city_id = c.id
        WHERE p.owner_id = $1
        ORDER BY p.created_at DESC
    `, [ownerId]);

    res.status(200).json({
        count: rows.length,
        properties: rows
    });
};

export const getMe = async (req, res, next) => {
    const userId = req.user.id;

    const { rows } = await pool.query(`
        SELECT
            id,
            name,
            email,
            phone,
            contact_views_count,
            created_at
        FROM users
        WHERE id = $1
    `, [req.user.id]);
    res.status(200).json(rows[0]);
};

export const getContactedProperties = async (req, res, next) => {
    const userId = req.user.id;

    // Fetch properties where the property ID exists inside the user's contacted array
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            c.name AS city_name
        FROM properties p
        JOIN cities c ON p.city_id = c.id
        WHERE p.id = ANY (
            (SELECT contacted_properties FROM users WHERE id = $1)::BIGINT[]
        )
        ORDER BY p.created_at DESC
    `, [userId]);

    // Hide owner IDs from the response
    const properties = rows.map(row => {
        const { owner_id, ...property } = row;
        return property;
    });

    res.status(200).json({
        count: properties.length,
        properties
    });
};