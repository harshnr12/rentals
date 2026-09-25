import express from 'express';
import protect from '../middlewares/auth.js';
import { validateBody, validateQuery } from "../middlewares/validate.js";
import {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty
} from '../controllers/propertyController.js';

const router = express.Router();

// Public Routes (Anyone can search and view)
router.get("/", validateQuery, getProperties);
router.get("/:id", getProperty);

// Protected Routes (Must be logged in as an owner)
router.use(protect);

router.post("/", validateBody, createProperty);
router.patch('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;