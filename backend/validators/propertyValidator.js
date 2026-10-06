import Joi from "joi";

// ---------------------------------------------------------
// CREATE PROPERTY SCHEMA
// Most fields are REQUIRED to ensure data integrity in the DB.
// Only a few specific amenities/preferences are OPTIONAL 
// (they use .default(false) or .default([]) if not provided).
// ---------------------------------------------------------
export const createPropertySchema = Joi.object({
    // --- Required Core Details ---
    cityId: Joi.number().integer().positive().required(),
    locality: Joi.string().trim().required(),
    rent: Joi.number().integer().positive().required(),
    deposit: Joi.number().integer().min(0).required(),
    carpetAreaSqft: Joi.number().integer().positive().required(),
    bedrooms: Joi.number().integer().min(1).required(),
    bathrooms: Joi.number().integer().min(1).required(),

    totalFloors: Joi.number().integer().min(0).required(),
    // Joi.ref ensures floorNo cannot exceed totalFloors dynamically before hitting the DB
    floorNo: Joi.number().integer().min(0).max(Joi.ref('totalFloors')).required()
        .messages({ 'number.max': '"floorNo" cannot be greater than "totalFloors"' }),

    furnishing: Joi.string().valid("unfurnished", "semi_furnished", "fully_furnished").required(),
    propertyType: Joi.string().valid("apartment", "villa").required(),

    // --- Optional Amenities (Defaults to false) ---
    hasParking: Joi.boolean().default(false),
    hasLift: Joi.boolean().default(false),

    // --- Optional Tenant Preferences (Defaults to false) ---
    allowSingleMale: Joi.boolean().default(false),
    allowSingleFemale: Joi.boolean().default(false),
    allowFamily: Joi.boolean().default(false),

    // --- Optional Media (Defaults to empty array) ---
    photos: Joi.array().items(
        Joi.string().trim().pattern(/^\/images\/[\w.-]+$/)
    ).default([])

}).custom((value, helpers) => {
    // Enforce domain logic: At least one tenant type must be allowed
    if (!value.allowSingleMale && !value.allowSingleFemale && !value.allowFamily) {
        return helpers.message("At least one tenant preference (allowSingleMale, allowSingleFemale, allowFamily) must be true");
    }
    return value;
});


// ---------------------------------------------------------
// PROPERTY SEARCH QUERY SCHEMA
// ALL fields here are OPTIONAL. Users can mix and match 
// any combination of filters to broaden or narrow their search.
// ---------------------------------------------------------
export const propertyQuerySchema = Joi.object({
    cityId: Joi.number().integer().positive(),
    locality: Joi.string().trim(),
    minRent: Joi.number().integer().min(0),
    maxRent: Joi.number().integer().min(0),

    minBedrooms: Joi.number().integer().min(1),
    minBathrooms: Joi.number().integer().min(1),

    propertyType: Joi.array().items(Joi.string().valid("apartment", "villa")).single(),
    furnishing: Joi.array().items(Joi.string().valid("unfurnished", "semi_furnished", "fully_furnished")).single(),

    floorNo: Joi.number().integer().min(0),
    totalFloors: Joi.number().integer().min(0),

    hasParking: Joi.boolean(),
    hasLift: Joi.boolean(),

    allowSingleMale: Joi.boolean(),
    allowSingleFemale: Joi.boolean(),
    allowFamily: Joi.boolean(),

    sort: Joi.string().valid("rent_asc", "rent_desc", "newest").default("newest")
});

// PROPERTY ID SCHEMA
export const propertyIdSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});