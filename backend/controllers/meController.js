import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';

// Reusable SQL fragments for authenticated-user data.
// $1 refers to the user ID passed to pool.query().
const contactedPropertyIdsQuery = `
    ARRAY(
        SELECT cp.property_id
        FROM contacted_properties cp
        WHERE cp.user_id = $1
        ORDER BY cp.contacted_at DESC
    )
`;

const lifetimeContactedPropertyCountQuery = `
    (
        SELECT COUNT(*)
        FROM contacted_properties cp
        WHERE cp.user_id = $1
    )
`;

const favoritePropertyIdsQuery = `
    ARRAY(
        SELECT f.property_id
        FROM favorites f
        WHERE f.user_id = $1
    )
`;

// GET /api/v1/me
export const getMe = async (req, res, next) => {

    const userId = req.user.id;

    const { rows } = await pool.query(`
        SELECT
            id,
            name,
            email,
            phone,
            created_at,
            ${lifetimeContactedPropertyCountQuery} AS lifetime_contacted_property_count,
            ${contactedPropertyIdsQuery} AS contacted_property_ids,
            ${favoritePropertyIdsQuery} AS favorited_property_ids
        FROM users
        WHERE id = $1
    `, [userId]);

    // Fetch user details together with contact-history
    // and favorite-property IDs for client-side app state.
    if (rows.length === 0) {
        return next(new CustomError(404, 'User not found'));
    }

    res.status(200).json({
        user: rows[0]
    });
};

// GET /api/v1/me/properties
export const getMyListedProperties = async (req, res, next) => {

    const userId = req.user.id;

    const { rows } = await pool.query(`
        SELECT
            p.*,
            c.name AS city_name
        FROM properties p
        JOIN cities c
            ON p.city_id = c.id
        WHERE p.owner_id = $1
        ORDER BY p.created_at DESC
    `, [userId]);

    res.status(200).json({
        count: rows.length,
        properties: rows
    });
};

// GET /api/v1/me/contacted
export const getMyContactedProperties = async (req, res, next) => {

    const userId = req.user.id;

    // Fetch properties from the user's contact history.
    // Deleted properties may still have history rows, but they are not
    // returned because there is no matching row in the properties table.
    const { rows } = await pool.query(`
        SELECT
            p.*,
            cp.contacted_at
        FROM contacted_properties cp
        JOIN properties p
            ON p.id = cp.property_id
        WHERE cp.user_id = $1
        ORDER BY cp.contacted_at DESC
    `, [userId]);

    // Hide internal owner IDs from the response.
    const properties = rows.map(row => {
        const { owner_id, ...property } = row;
        return property;
    });

    // Lifetime number of unique properties ever contacted.
    // This includes properties that may have been deleted.
    const { rows: countRows } = await pool.query(`
        SELECT ${lifetimeContactedPropertyCountQuery}
            AS lifetime_contacted_property_count
    `, [userId]);

    const lifetime_contacted_property_count =
        countRows[0].lifetime_contacted_property_count;

    res.status(200).json({
        lifetime_contacted_property_count,
        count: properties.length,
        properties
    });

};