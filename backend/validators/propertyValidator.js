import Joi from "joi";

// POST /api/v1/properties
const createPropertySchema = Joi.object({
    title: Joi.string().min(1).required(),

    city: Joi.string().required(),

    locality: Joi.string().required(),

    rent: Joi.number().min(0).required(),

    maintenance: Joi.number()
        .min(0)
        .default(0),

    bedrooms: Joi.number()
        .integer()
        .min(1)
        .default(1),

    bathrooms: Joi.number()
        .integer()
        .min(1)
        .default(1),

    furnished: Joi.boolean()
        .default(false),

    parking: Joi.boolean()
        .default(false),

    lift: Joi.boolean()
        .default(false),

    garden: Joi.boolean()
        .default(false),

    available: Joi.boolean()
        .default(true),

    allowed: Joi.string()
        .valid("family", "single_male", "single_female")
        .default("family")
});


// GET /api/v1/properties
const propertyQuerySchema = Joi.object({
    city: Joi.string(),

    locality: Joi.string(),

    minRent: Joi.number()
        .min(0),

    maxRent: Joi.number()
        .min(0),

    bedrooms: Joi.number()
        .integer()
        .min(1),

    bathrooms: Joi.number()
        .integer()
        .min(1),

    furnished: Joi.boolean(),

    available: Joi.boolean(),

    amenities: Joi.string(),

    allowed: Joi.string()
        .valid("family", "single_male", "single_female"),

    sort: Joi.string()
        .valid("asc", "des")
        .default("des")
});


// GET /api/v1/properties/:id
const propertyParamsSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
});


export {
    createPropertySchema,
    propertyQuerySchema,
    propertyParamsSchema
};