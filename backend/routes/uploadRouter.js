import express from 'express';
import upload from '../middlewares/multerConfig.js';
import { uploadImages } from '../controllers/uploadController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

// 'photos' is the multipart form-data field name
//  expected from the client

router.post(
    '/',
    protect,
    upload.array('photos', 10),
    uploadImages
);

export default router;