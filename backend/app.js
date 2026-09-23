import express from 'express';
import cors from 'cors';

import errorHandler from './middlewares/errorHandler.js';
import apiRouter from './routes/apiRouter.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', apiRouter);

app.get('/', (req, res) => {
    res.json({ message: '99acres Rentals API is running!' });
});

// 404 — no route matched
app.all('*', (req, res) => {
    res.status(404).json({
        message: `.Cannot ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use(errorHandler);

export default app;
