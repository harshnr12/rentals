import 'dotenv/config';
import pg from 'pg';

import app from './app.js';

const { Pool } = pg;

const port = process.env.PORT || 8000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/api/check', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT NOW() AS current_time, current_database() AS db_name'
    );

    const { db_name, current_time } = result.rows[0];

    res.json({
      status: 'success',
      database: db_name,
      server_time: current_time,
    });
  } catch (err) {
    console.error('PostgreSQL query error:', err.message);

    res.status(500).json({
      error: 'Database connection failed',
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});