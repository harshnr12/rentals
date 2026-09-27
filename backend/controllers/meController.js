import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';

export const getMe = async (req, res, next) => {
    const userId = req.user.id;

    // Fetch user details, contacted history,
    //  and aggregate favorite IDs into a single array
    const { rows } = await pool.query(`
        SELECT 
            id, 
            name, 
            email, 
            phone, 
            created_at,
            contacted_properties,
            ARRAY(SELECT property_id FROM favorites WHERE user_id = $1) AS favorite_property_ids
        FROM users
        WHERE id = $1
    `, [userId]);

    if (rows.length === 0) {
        return next(new CustomError(404, 'User not found'));
    }

    res.status(200).json({
        user: rows[0]
    });
};

export const getMyProperties = async (req, res, next) => {
    const userId = req.user.id;

    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            c.name AS city_name
        FROM properties p
        JOIN cities c ON p.city_id = c.id
        WHERE p.owner_id = $1
        ORDER BY p.created_at DESC
    `, [userId]);

    res.status(200).json({
        count: rows.length,
        properties: rows
    });
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