import express from 'express';
import upload from '../middlewares/multerConfig.js';
import { uploadImage } from '../controllers/uploadController.js';
import authenticateToken from '../middlewares/authMiddleware.js'; // Adjust path if named differently

const router = express.Router();

// 'photo' is the multipart form-data field name expected from the client
router.post(
    '/',
    authenticateToken,
    upload.single('photo'),
    uploadImage
);

export default router;