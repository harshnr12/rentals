import express from 'express';
import upload from '../middlewares/multerConfig.js';
import { uploadImage } from '../controllers/uploadController.js';
import protect from '../middlewares/auth.js';
const router = express.Router();

// 'photo' is the multipart form-data field name expected from the client
router.post(
    '/',
    protect,
    upload.single('photo'),
    uploadImage
);

export default router;