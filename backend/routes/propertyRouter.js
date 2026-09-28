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
    createProperty,
    updateProperty,
    deleteProperty,

} from '../controllers/propertyController.js';
import contactRouter from './contactRouter.js';
const router = express.Router();

// Validate every :id parameter in this router
router.param('id', validateParams);

// Public Routes
router.get("/", validateQuery, getProperties);
router.get("/:id", getProperty);

// Protected Routes after this Point
router.use(protect);

// Contact route — any logged-in user can view owner contact
router.use("/:id/contact", contactRouter);

// Delete does not need body validation
router.delete('/:id', deleteProperty);

// Body validation for property creation/update
router.use(validateBody);

router.post("/", createProperty);
router.patch('/:id', updateProperty);

export default router;
