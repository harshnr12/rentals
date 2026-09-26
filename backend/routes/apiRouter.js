import express from 'express';

import authRouter from './authRouter.js';
import propertyRouter from './propertyRouter.js';
import uploadRouter from './uploadRouter.js';
import configRouter from './configRouter.js';
import meRouter from './meRouter.js';

const router = express.Router();

router.use('/auth', authRouter);

router.use('/config', configRouter);
router.use('/me', meRouter);


router.use('/properties', propertyRouter);
router.use('/upload', uploadRouter);

export default router;