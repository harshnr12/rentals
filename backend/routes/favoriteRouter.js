// backend/routes/favoriteRoutes.js
import express from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favoriteController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all favorite routes at once
router.use(verifyToken);

router.get('/', getMyFavorites);
router.post('/:propertyId', toggleFavorite);

export default router;