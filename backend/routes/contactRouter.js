import express from 'express';

import { contactLimiter } from '../middlewares/rateLimiter.js';
import { getPropertyContact } from '../controllers/contactController.js';

const router = express.Router({ mergeParams: true });

router.use(contactLimiter);

router.get('/', getPropertyContact);

export default router;