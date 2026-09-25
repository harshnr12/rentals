import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { validateBody } from '../middlewares/validate.js';

const router = express.Router();

router.post('/signup', validateBody, signup);
router.post('/login', validateBody, login);

export default router;