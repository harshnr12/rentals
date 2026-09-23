import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';

const signup = async (req, res, next) => {
    const { name, email, password } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check whether email already exists
        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            throw new CustomError(409, 'Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const userResult = await client.query(
            `INSERT INTO users (email, password_hash)
             VALUES ($1, $2)
             RETURNING id, email`,
            [email, passwordHash]
        );

        const user = userResult.rows[0];

        // Create profile
        await client.query(
            `INSERT INTO user_profiles (user_id, name)
             VALUES ($1, $2)`,
            [user.id, name]
        );

        await client.query('COMMIT');

        // Create JWT
        const token = jwt.sign(
            { id: user.id },
            process.env.SECRET_STR,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user,
            token
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);

    } finally {
        client.release();
    }
};


const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT
                u.id,
                u.email,
                u.password_hash,
                up.name
             FROM users u
             JOIN user_profiles up
                ON up.user_id = u.id
             WHERE u.email = $1`,
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            throw new CustomError(401, 'Invalid email or password');
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordCorrect) {
            throw new CustomError(401, 'Invalid email or password');
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.SECRET_STR,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {
        next(error);
    }
};


const protect = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;

        if (!auth || !auth.startsWith('Bearer ')) {
            throw new CustomError(401, 'Please log in');
        }

        const token = auth.substring(7);

        const decoded = jwt.verify(
            token,
            process.env.SECRET_STR
        );

        const result = await pool.query(
            `SELECT id, email
             FROM users
             WHERE id = $1`,
            [decoded.id]
        );

        const user = result.rows[0];

        if (!user) {
            throw new CustomError(401, 'User no longer exists');
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


export {
    signup,
    login,
    protect
};