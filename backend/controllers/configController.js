import pool from '../db/pool.js';

// Server-side in-memory cache for configuration data.
// The config changes rarely, so keep it in RAM and avoid querying
// PostgreSQL on every /config request.
let cachedConfig = null;

export const getConfigData = async (req, res, next) => {

    // Fetch config from PostgreSQL only when the server-side cache is empty,
    // normally on the first request after server startup.
    if (!cachedConfig) {
        const { rows: cities } = await pool.query(`
            SELECT id, name
            FROM cities
            ORDER BY name ASC
        `);

        cachedConfig = {
            // 1. OPTIONS: Strict enums and database lists
            options: {
                cities,
                propertyTypes: ['apartment', 'villa'],
                furnishingTypes: ['unfurnished', 'semi_furnished', 'fully_furnished'],
                sorts: ['newest', 'rent_asc', 'rent_desc']
            },

            // 2. VALIDATION: Exact reflection of Joi schemas
            fieldValidation: {
                cityId: { type: 'number', required: true, min: 1 },
                locality: { type: 'string', required: true },

                // Numbers
                rent: { type: 'number', required: true, min: 1 },
                deposit: { type: 'number', required: true, min: 0 },
                carpetAreaSqft: { type: 'number', required: true, min: 1 },
                bedrooms: { type: 'number', required: true, min: 1 },
                bathrooms: { type: 'number', required: true, min: 1 },
                totalFloors: { type: 'number', required: true, min: 0 },
                floorNo: { type: 'number', required: true, min: 0 },

                // Strings (Enums)
                furnishing: { type: 'string', required: true },
                propertyType: { type: 'string', required: true },

                // Booleans
                hasParking: { type: 'boolean', required: false, default: false },
                hasLift: { type: 'boolean', required: false, default: false },

                // Tenant Rules 
                allowSingleMale: { type: 'boolean', required: false, default: false },
                allowSingleFemale: { type: 'boolean', required: false, default: false },
                allowFamily: { type: 'boolean', required: false, default: false },

                // Arrays
                photos: {
                    type: 'array',
                    required: false,
                    maxCount: 10,
                    maxSizeMb: 5,
                    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
                }
            },

            // 3. CROSS-FIELD CONSTRAINTS: Complex domain logic
            crossFieldValidations: [
                {
                    ruleType: 'less_than_or_equal',
                    field: 'floorNo',
                    targetField: 'totalFloors',
                    errorMessage: 'Floor number cannot be greater than total floors'
                },
                {
                    ruleType: 'require_at_least_one_true',
                    fields: ['allowSingleMale', 'allowSingleFemale', 'allowFamily'],
                    errorMessage: 'At least one tenant preference must be selected'
                }
            ]
        };
    }

    // Allow clients and HTTP caches to reuse this response for 24 hours(86,400s).
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Return the cached config from the
    //  server-side cache without querying PostgreSQL.
    res.status(200).json(cachedConfig);
};


// Clear the server-side cache when config data changes.
export const clearConfigCache = () => {
    cachedConfig = null;
};