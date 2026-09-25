import express from 'express';

import authRouter from './authRouter.js';
import propertyRouter from './propertyRouter.js';
import favoriteRouter from './favoriteRouter.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/properties', propertyRouter);
router.use('/favorites', favoriteRouter);

export default router;