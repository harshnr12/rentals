import express from 'express';

import {
    signup,
    login
} from '../controllers/authController.js';

import validate from '../middlewares/validate.js';

import {
    registerSchema,
    loginSchema
} from '../validators/authValidator.js';

const router = express.Router();

router.post(
    '/signup',
    validate(registerSchema, 'body'),
    signup
);

router.post(
    '/login',
    validate(loginSchema, 'body'),
    login
);

export default router;