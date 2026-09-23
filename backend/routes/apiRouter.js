import express from 'express';

import authRouter from './authRouter.js';
import propertyRouter from './propertyRouter.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/properties', propertyRouter);

export default router;