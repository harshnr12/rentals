import express from 'express';
import protect from '../middlewares/auth.js';
import favoriteRouter from './favoriteRouter.js';
import { getMyProperties, getMe } from '../controllers/meController.js';

const router = express.Router();

// Protected all Routes
router.use(protect);

router.use('/favorites', favoriteRouter);


router.get("/properties", getMyProperties);
router.get('/', getMe);


export default router;
