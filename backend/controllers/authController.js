import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';

export const signup = async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existingUser.rows.length > 0) {
        return next(new CustomError(409, 'Email already registered'));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, phone)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, phone`,
        [name, email, passwordHash, phone]
    );

    const user = rows[0];

    const token = jwt.sign(
        { id: user.id },
        process.env.SECRET_STR,
        { expiresIn: '7d' }
    );

    res.status(201).json({
        user,
        token
    });
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    const { rows } = await pool.query(
        `SELECT id, name, email, phone, password_hash
         FROM users
         WHERE email = $1`,
        [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return next(new CustomError(401, 'Invalid email or password'));
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET_STR, { expiresIn: '7d' });

    // Manually mapping the fields guarantees the password_hash is never sent to the client.
    res.status(200).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        },
        token
    });
};