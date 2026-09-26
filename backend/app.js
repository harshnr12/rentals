import express from 'express';
import cors from 'cors';
import path from 'path';

import logger from './middlewares/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import apiRouter from './routes/apiRouter.js';

const app = express();

// Middlewares
app.use(cors());                         // 1. Security/Access
app.use(logger);                         // 2. Monitoring
app.use(express.static(path.join(import.meta.dirname, 'public'), { maxAge: '1d' })); // 3. Static Assets
app.use(express.json());                 // 4. Body Parsing

// Routes
app.use('/api/v1', apiRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Rentals API is running!' });
});

// 404 — catch unknown routes
app.all('*', (req, res) => {
    res.status(404).json({
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use(errorHandler);

export default app;