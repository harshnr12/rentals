import express from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favoriteController.js';

const router = express.Router();


router.get('/', getMyFavorites);
router.post('/:propertyId', toggleFavorite);

export default router;