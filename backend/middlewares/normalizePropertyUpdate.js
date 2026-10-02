import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';


const propertyMapper = (row) => ({
    cityId: row.city_id,
    locality: row.locality,
    rent: row.rent,
    deposit: row.deposit,
    carpetAreaSqft: row.carpet_area_sqft,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    floorNo: row.floor_no,
    totalFloors: row.total_floors,
    furnishing: row.furnishing,
    propertyType: row.property_type,
    hasParking: row.has_parking,
    hasLift: row.has_lift,
    allowSingleMale: row.allow_single_male,
    allowSingleFemale: row.allow_single_female,
    allowFamily: row.allow_family,
    photos: row.photos,
});

// A middleware loads the property, checks ownership,
//  and merges the body over existing values. That way
//  Joi validates the full object,
//  so cross-field rules like floor ≤ total floors work.

const normalizePropertyUpdate = async (req, res, next) => {

    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new CustomError(400, 'No fields to update'));
    }

    const { id } = req.params;

    // Find existing property
    const { rows } = await pool.query(
        'SELECT * FROM properties WHERE id = $1',
        [id]
    );

    const existing = rows[0];

    if (!existing) {
        return next(new CustomError(404, 'Property not found'));
    }

    const userId = req.user.id;

    if (existing.owner_id !== userId) {
        return next(new CustomError(403, 'You can only update your own properties'));
    }

    // Keep the existing property available to the controller
    // so it does not need to query the database again.
    req.existingProperty = existing;

    // body wins, existing fills gaps
    req.body = { ...propertyMapper(existing), ...req.body };

    next();
};


export default normalizePropertyUpdate;
