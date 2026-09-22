import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: '99acres Rentals API is running!' });
});

// Test route querying PostgreSQL
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name;');
    res.json({
      status: 'success',
      database: result.rows[0].db_name,
      server_time: result.rows[0].current_time
    });
  } catch (err) {
    console.error('PostgreSQL query error:', err.message);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
