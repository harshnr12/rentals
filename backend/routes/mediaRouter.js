import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import CustomError from '../utils/CustomError.js';

const router = express.Router();
const imagesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/properties');

router.get('/:filename', (req, res, next) => {
    res.sendFile(req.params.filename, { root: imagesDir, maxAge: '1d' }, (err) => {
        if (err) {
            return next(new CustomError(404, 'Image not found'));
        }
    });
});

export default router;