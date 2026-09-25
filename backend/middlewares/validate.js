import CustomError from "../utils/CustomError.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { createPropertySchema, propertyQuerySchema } from "../validators/propertyValidator.js";

export const validateBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new CustomError(400, "Request body cannot be empty"));
    }

    let schema;
    if (req.originalUrl.includes('/signup')) schema = registerSchema;
    else if (req.originalUrl.includes('/login')) schema = loginSchema;
    else if (req.originalUrl.includes('/properties')) schema = createPropertySchema;

    if (!schema) return next();

    const { error, value } = schema.validate(req.body, {
        abortEarly: false, // Finds all errors
        stripUnknown: true
    });

    if (error) {
        // Maps all Joi errors into a single comma-separated string
        const errorMessage = error.details.map(err => err.message).join(', ');
        return next(new CustomError(400, errorMessage));
    }

    req.body = value;
    next();
};

export const validateQuery = (req, res, next) => {
    if (!req.query || Object.keys(req.query).length === 0) {
        return next();
    }

    let schema;
    if (req.originalUrl.includes('/properties')) schema = propertyQuerySchema;

    if (!schema) return next();

    const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        // Maps all Joi errors into a single comma-separated string
        const errorMessage = error.details.map(err => err.message).join(', ');
        return next(new CustomError(400, errorMessage));
    }

    req.query = value;
    next();
};