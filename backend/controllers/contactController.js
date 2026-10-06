import pool from '../db/pool.js';

// GET api/v1/properties/:id/contact
export const getPropertyContact = async (req, res, next) => {

    const { id } = req.params;
    const userId = req.user.id;

    // 1. Fetch the property's owner contact details
    const { rows } = await pool.query(`
        SELECT
            u.name AS owner_name,
            u.phone AS owner_phone
        FROM users u
        JOIN properties p ON p.owner_id = u.id
        WHERE p.id = $1
    `, [id]);

    if (rows.length === 0) {
        return next(new CustomError(404, 'Property not found'));
    }

    // 2. Record this property in the user's contact history
    // The composite primary key + ON CONFLICT prevents duplicate
    // entries when the user contacts the same property again.
    await pool.query(`
        INSERT INTO contacted_properties (
            user_id,
            property_id
        )
        VALUES ($1, $2)
        ON CONFLICT (user_id, property_id) DO NOTHING
    `, [userId, id]);

    // Prevent caching of private, user-specific contact information.
    res.setHeader('Cache-Control', 'no-store');

    res.status(200).json({
        owner: rows[0]
    });
};
