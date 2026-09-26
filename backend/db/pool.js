import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('error', (error) => {
    console.error('PostgreSQL pool error:', error);
});

const connectDatabase = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('PostgreSQL connected');
    } catch (error) {
        console.error('PostgreSQL connection failed:', error.message);
        process.exit(1);
    }
};

connectDatabase();

export default pool;