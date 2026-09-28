import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';

// Reusable SQL fragments for the authenticated user's profile.
const contactedPropertyIdsQuery = `
    ARRAY(
        SELECT cp.property_id
        FROM contacted_properties cp
        WHERE cp.user_id = u.id
        ORDER BY cp.contacted_at DESC
    )
`;

const contactedPropertyCountQuery = `
    (
        SELECT COUNT(*)
        FROM contacted_properties cp
        WHERE cp.user_id = u.id
    )
`;

const favoritePropertyIdsQuery = `
    ARRAY(
        SELECT f.property_id
        FROM favorites f
        WHERE f.user_id = u.id
    )
`;


export const getMe = async (req, res, next) => {

    const userId = req.user.id;

    const { rows } = await pool.query(`
        SELECT
            u.id,
            u.name,
            u.email,
            u.phone,
            u.created_at,
            ${contactedPropertyCountQuery} AS contacted_property_count,
            ${contactedPropertyIdsQuery} AS contacted_property_ids,
            ${favoritePropertyIdsQuery} AS favorite_property_ids
        FROM users u
        WHERE u.id = $1
    `, [userId]);

    // Fetch user details, contacted history,
    //  and aggregate favorite IDs into a single array
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

    // Fetch the user's contacted properties from the contact history table.
    // A deleted property may still have a history row, but it is not returned
    // here because the corresponding property no longer exists.

    const { rows } = await pool.query(`
        SELECT
            p.*
        FROM contacted_properties cp
        JOIN properties p
            ON p.id = cp.property_id
        WHERE cp.user_id = $1
        ORDER BY cp.contacted_at DESC
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