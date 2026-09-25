import express from 'express';
import cors from 'cors';

import logger from './middlewares/logger.js';
import errorHandler from './middlewares/errorHandler.js';

import apiRouter from './routes/apiRouter.js';
import mediaRouter from './routes/mediaRouter.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger); //custom logger


// Routes
app.use('/api/images', mediaRouter);
app.use('/api/v1', apiRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ message: '99acres Rentals API is running!' });
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