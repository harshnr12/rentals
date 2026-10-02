import express from 'express';
import protect from '../middlewares/auth.js';
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { getProperties, createProperty } from '../controllers/propertyController.js';
import propertyIdRouter from './propertyIdRouter.js';

const router = express.Router();


// Public collection route
router.get("/", validateQuery, getProperties);

// All routes for a specific property
router.use('/:id', propertyIdRouter);

// Protected collection route
router.use(protect);

// Validate property creation
router.post("/", validateBody, createProperty);


export default router;
