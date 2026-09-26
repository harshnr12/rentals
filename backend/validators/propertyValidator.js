import Joi from "joi";

export const createPropertySchema = Joi.object({
    cityId: Joi.number().integer().positive().required(),
    title: Joi.string().trim().min(5).required(),
    locality: Joi.string().trim().required(),
    rent: Joi.number().integer().positive().required(),
    deposit: Joi.number().integer().min(0).required(),
    carpetAreaSqft: Joi.number().integer().positive().required(),
    bedrooms: Joi.number().integer().min(1).required(),
    bathrooms: Joi.number().integer().min(1).required(),
    floorNo: Joi.number().integer().min(0).required(),
    furnishing: Joi.string().valid("unfurnished", "semi_furnished", "fully_furnished").required(),
    propertyType: Joi.string().valid("apartment", "villa").required(),
    hasParking: Joi.boolean().default(false),
    hasLift: Joi.boolean().default(false),
    photos: Joi.array().items(Joi.string().trim()).default([])
});

export const propertyQuerySchema = Joi.object({
    cityId: Joi.number().integer().positive(),
    locality: Joi.string().trim(),
    minRent: Joi.number().integer().min(0),
    maxRent: Joi.number().integer().min(0),
    bedrooms: Joi.number().integer().min(1),
    propertyType: Joi.string().valid("apartment", "villa"),
    sort: Joi.string().valid("rent_asc", "rent_desc", "newest").default("newest")
});

export const propertyIdSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});