import express from 'express';
import protect from '../middlewares/auth.js';
import normalizePropertyUpdate from '../middlewares/normalizePropertyUpdate.js';
import { validateBody, validateParams } from "../middlewares/validate.js";
import {
    getProperty,
    updateProperty,
    deleteProperty,
} from '../controllers/propertyController.js';
import contactRouter from './contactRouter.js';

const router = express.Router({ mergeParams: true });

// Validate the property ID for all routes in this router.
router.use(validateParams);

// Public property details
router.get("/", getProperty);

// Protected Routes after this Point
router.use(protect);

// Contact route — any logged-in user can view owner contact
router.use("/contact", contactRouter);


// Delete does not need body validation
router.delete('/', deleteProperty);

// Normalize PATCH into a complete property object first,
// then validate the normalized body.
router.patch(
    '/',
    normalizePropertyUpdate,
    validateBody,
    updateProperty
);


export default router;
