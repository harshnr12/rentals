import express from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favoriteController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

// Apply auth protection to all favorite routes at once
router.use(protect);

router.get('/', getMyFavorites);
router.post('/:propertyId', toggleFavorite);

export default router;