import express from 'express';

import { getConfigData } from '../controllers/configController.js';

const router = express.Router();


router.get('/', getConfigData);


export default router;
