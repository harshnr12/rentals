import pool from '../db/pool.js';

export const getConfigData = async (req, res) => {
    const { rows: cities } = await pool.query(`
        SELECT id, name
        FROM cities
        ORDER BY name ASC
    `);

    res.status(200).json({
        // 1. OPTIONS: Strict enums and database lists
        options: {
            cities,
            propertyTypes: ['apartment', 'villa'],
            furnishingTypes: ['unfurnished', 'semi_furnished', 'fully_furnished'],
            sorts: ['newest', 'rent_asc', 'rent_desc']
        },

        // 2. VALIDATION: Exact reflection of Joi schemas
        validation: {
            cityId: { type: 'number', required: true, min: 1 },
            locality: { type: 'string', required: true },

            // Numbers
            rent: { type: 'number', required: true, min: 1 },
            deposit: { type: 'number', required: true, min: 0 },
            carpetAreaSqft: { type: 'number', required: true, min: 1 },
            bedrooms: { type: 'number', required: true, min: 1 },
            bathrooms: { type: 'number', required: true, min: 1 },
            floorNo: { type: 'number', required: true, min: 0 },

            // Strings (Enums)
            furnishing: { type: 'string', required: true },
            propertyType: { type: 'string', required: true },

            // Booleans
            hasParking: { type: 'boolean', required: false, default: false },
            hasLift: { type: 'boolean', required: false, default: false },

            // Arrays
            photos: {
                type: 'array',
                required: false,
                maxCount: 10,  // Tied to multer upload.array('photos', 10)
                maxSizeMb: 5,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
            }
        }
    });
};