import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';

export const getProperty = async (req, res, next) => {
    const result = await pool.query(
        'SELECT * FROM properties WHERE id = $1',
        [req.params.id]
    );

    if (result.rows.length === 0) {
        return next(
            new CustomError(404, 'Property not found')
        );
    }

    res.status(200).json({
        property: result.rows[0]
    });
};