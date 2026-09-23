import Joi from "joi";

// POST /api/v1/properties
const createPropertySchema = Joi.object({
    cityId: Joi.number().integer().positive().required(),
    locationId: Joi.number().integer().positive().required(),
    description: Joi.string().trim().min(5).allow('', null),
    rent: Joi.number().integer().positive().required(),
    maintenance: Joi.number().integer().min(0).default(0),
    rooms: Joi.number().integer().min(1).required(),
    bathrooms: Joi.number().integer().min(1).default(1),
    hasHall: Joi.boolean().default(false),
    hasKitchen: Joi.boolean().default(false),
    propertyType: Joi.string()
        .valid("flat", "house", "builder_floor", "villa", "duplex")
        .required(),
    tenantPreference: Joi.string()
        .valid("family", "bachelors", "any")
        .default("any"),
    furnishing: Joi.string()
        .valid("unfurnished", "semi_furnished", "fully_furnished")
        .default("unfurnished"),
    floor: Joi.number().integer().min(0).required(),
    totalFloors: Joi.number().integer().min(1).required(),
    lift: Joi.boolean().default(false),
    parking: Joi.boolean().default(false),
    photos: Joi.array().items(Joi.string().trim()).default([])
}).custom((value, helpers) => {
    if (value.floor > value.totalFloors) {
        return helpers.message("floor cannot be greater than totalFloors");
    }
    return value;
});

// GET /api/v1/properties (Search & Filters)
const propertyQuerySchema = Joi.object({
    cityId: Joi.number().integer().positive(),
    locationId: Joi.number().integer().positive(),
    minRent: Joi.number().integer().min(0),
    maxRent: Joi.number().integer().min(0),
    rooms: Joi.number().integer().min(1),
    bathrooms: Joi.number().integer().min(1),
    propertyType: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid("flat", "house", "builder_floor", "villa", "duplex")),
        Joi.string().valid("flat", "house", "builder_floor", "villa", "duplex")
    ),
    furnishing: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid("unfurnished", "semi_furnished", "fully_furnished")),
        Joi.string().valid("unfurnished", "semi_furnished", "fully_furnished")
    ),
    tenantPreference: Joi.string().valid("family", "bachelors", "any"),
    hasHall: Joi.boolean(),
    hasKitchen: Joi.boolean(),
    lift: Joi.boolean(),
    parking: Joi.boolean(),
    sort: Joi.string().valid("rent_asc", "rent_desc", "newest").default("rent_asc")
});

// GET /api/v1/properties/:id
const propertyParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

export {
    createPropertySchema,
    propertyQuerySchema,
    propertyParamsSchema
};