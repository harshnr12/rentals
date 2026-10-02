import multer from 'multer';
import path from 'path';
import crypto from 'node:crypto';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Points to backend/public/images
        cb(null, path.join(import.meta.dirname, '../public/images'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const userId = req.user?.id ?? 'guest';
        const uniqueName = `user_${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    // 1. Define the exact same allowed types as your configController
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // 2. Strictly check against the array
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // 3. Reject anything else (like SVGs or GIFs)
        cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

export default upload;
