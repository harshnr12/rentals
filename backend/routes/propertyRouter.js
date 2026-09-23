import express from 'express';

import { protect } from '../middleware/auth.js';
import {
    createPropertySchema,
    propertyQuerySchema,
    propertyParamsSchema
} from "../validators/propertyValidator.js";

import validate from "../middlewares/validate.js";


import {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty
} from '../controllers/propertyController.js';


const router = express.Router();

router.use(protect);



// POST /api/v1/properties
router.post(
    "/",
    validate(createPropertySchema, "body"),
    createProperty
);


// GET /api/v1/properties
router.get(
    "/",
    validate(propertyQuerySchema, "query"),
    getProperties
);


// GET /api/v1/properties/:id
router.get(
    "/:id",
    validate(propertyParamsSchema, "params"),
    getProperty
);
router.patch('/:id', updateProperty);
router.delete('/:id', deleteProperty);


export default router;