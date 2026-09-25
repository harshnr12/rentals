import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const imagesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/properties');

router.get('/:filename', (req, res) => {
    res.sendFile(req.params.filename, { root: imagesDir, maxAge: '1d' }, (err) => {
        if (err) {
            res.status(err.status || 404).json({ error: 'Image not found' });
        }
    });
});

export default router;