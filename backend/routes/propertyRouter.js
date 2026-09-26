import express from 'express';
import protect from '../middlewares/auth.js';
import {
    validateBody,
    validateQuery,
    validateParams
} from "../middlewares/validate.js";
import {
    getProperties,
    getProperty,
    getPropertyContact,
    createProperty,
    updateProperty,
    deleteProperty
} from '../controllers/propertyController.js';

const router = express.Router();

// Public Routes
router.get("/", validateQuery, getProperties);
router.get("/:id", validateParams, getProperty);

// Protected Routes after this Point
router.use(protect);

// Contact route — any logged-in user can view owner contact
router.get("/:id/contact", getPropertyContact);

// Owner-only Routes
router.post("/", validateBody, createProperty);
router.patch('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;
