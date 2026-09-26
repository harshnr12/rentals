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
        SELECT id, name, email, phone
        FROM users
        WHERE id = $1
    `, [userId]);
    res.status(200).json(rows[0]);
};