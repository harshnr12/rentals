import 'dotenv/config';

import pool from '../db/pool.js';

const testDb = async () => {
    try {
        const result = await pool.query('SELECT NOW()');

        console.log('Database connected successfully.');
        console.log('Database time:', result.rows[0].now);

    } catch (error) {
        console.error('Database connection failed:');
        console.error(error.message);

    } finally {
        await pool.end();
    }
};

testDb();