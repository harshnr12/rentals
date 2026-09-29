import express from 'express';
import protect from '../middlewares/auth.js';
import favoriteRouter from './favoriteRouter.js';
import {
    getMyListedProperties,
    getMe,
    getMyContactedProperties
} from '../controllers/meController.js';

const router = express.Router();

// Protected all Routes
router.use(protect);

router.use('/favorites', favoriteRouter);

router.get("/properties", getMyListedProperties);
router.get("/contacted", getMyContactedProperties);
router.get('/', getMe);


export default router;
