import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';

const protect = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;

        if (!auth || !auth.startsWith('Bearer ')) {
            return next(new CustomError(401, 'Please log in'));
        }

        const token = auth.substring(7);
        const decoded = jwt.verify(token, process.env.SECRET_STR);

        const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [decoded.id]);
        const user = rows[0];

        if (!user) {
            return next(new CustomError(401, 'User no longer exists'));
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new CustomError(401, 'Invalid token'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new CustomError(401, 'Token expired'));
        }

        next(error);
    }
};

export default protect;

// jwt.verify() runs synchronously.
// When a token is invalid or expired,
// it immediately throws a raw JavaScript error
// (JsonWebTokenError or TokenExpiredError)
// so try catch is needed
