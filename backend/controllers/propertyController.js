import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';
import deletePhotoFiles from '../utils/fileUtils.js';

/**
 * GET /properties
 *     → property listings
 *     → no owner information (name, phone, ID)
 *
 * GET /properties/:id
 *     → property details
 *     → no owner information (name, phone, ID)
 *
 *
 * GET /properties/:id/contact
 *     → LOGIN REQUIRED
 *     → owner name + phone only (no owner ID)
 *     → rate limited (10 views / 24 hours per user via contactLimiter)
 *     → appends property ID to user's contacted_properties array (deduplicated)
 */

export const getProperties = async (req, res, next) => {

    const {
        cityId,
        locality,
        minRent,
        maxRent,
        bedrooms,
        bathrooms,
        propertyType,
        floorNo,
        totalFloors,
        furnishing,
        hasParking,
        hasLift,
        allowSingleMale,
        allowSingleFemale,
        allowFamily,
        sort
    } = req.validatedQuery;

    const conditions = ['1 = 1'];
    const values = [];

    // --- Standard Filters ---
    if (cityId) {
        values.push(cityId);
        conditions.push(`city_id = $${values.length}`);
    }
    if (locality) {
        values.push(`%${locality}%`);
        conditions.push(`locality ILIKE $${values.length}`);
    }
    if (minRent !== undefined) {
        values.push(minRent);
        conditions.push(`rent >= $${values.length}`);
    }
    if (maxRent !== undefined) {
        values.push(maxRent);
        conditions.push(`rent <= $${values.length}`);
    }

    // --- Multi-Select Array Filters (Using ANY) ---
    if (bedrooms && bedrooms.length > 0) {
        values.push(bedrooms);
        conditions.push(`bedrooms = ANY($${values.length})`);
    }
    if (bathrooms && bathrooms.length > 0) {
        values.push(bathrooms);
        conditions.push(`bathrooms = ANY($${values.length})`);
    }
    if (propertyType && propertyType.length > 0) {
        values.push(propertyType);
        conditions.push(`property_type = ANY($${values.length})`);
    }
    if (furnishing && furnishing.length > 0) {
        values.push(furnishing);
        conditions.push(`furnishing = ANY($${values.length})`);
    }

    // --- Exact Match Filters ---
    if (floorNo !== undefined) {
        values.push(floorNo);
        conditions.push(`floor_no = $${values.length}`);
    }
    if (totalFloors !== undefined) {
        values.push(totalFloors);
        conditions.push(`total_floors = $${values.length}`);
    }
    if (hasParking !== undefined) {
        values.push(hasParking);
        conditions.push(`has_parking = $${values.length}`);
    }
    if (hasLift !== undefined) {
        values.push(hasLift);
        conditions.push(`has_lift = $${values.length}`);
    }

    // --- Tenant Preferences (Grouped as OR logic) ---
    // If a user selects Single Male AND Family, they want properties that allow EITHER.
    const tenantConditions = [];

    if (allowSingleMale === true) {
        tenantConditions.push('allow_single_male = true');
    }
    if (allowSingleFemale === true) {
        tenantConditions.push('allow_single_female = true');
    }
    if (allowFamily === true) {
        tenantConditions.push('allow_family = true');
    }

    // If any tenant filters were selected, group them in parentheses
    if (tenantConditions.length > 0) {
        conditions.push(`(${tenantConditions.join(' OR ')})`);
    }

    let orderBy = 'ORDER BY created_at DESC';

    if (sort === 'rent_asc') {
        orderBy = 'ORDER BY rent ASC';
    }

    if (sort === 'rent_desc') {
        orderBy = 'ORDER BY rent DESC';
    }

    if (sort === 'newest') {
        orderBy = 'ORDER BY created_at DESC';
    }

    const query = `
        SELECT *
        FROM properties
        WHERE ${conditions.join(' AND ')}
        ${orderBy}
        LIMIT 200;
    `;

    const { rows } = await pool.query(query, values);

    // Hide owner IDs from public response
    const properties = rows.map(row => {
        const { owner_id, ...property } = row;
        return property;
    });

    res.status(200).json({
        count: properties.length,
        properties
    });
};

export const getProperty = async (req, res, next) => {

    const { id } = req.params;

    const { rows } = await pool.query(`
        SELECT *
        FROM properties
        WHERE id = $1
    `, [id]);

    if (rows.length === 0) {
        return next(new CustomError(404, 'Property not found'));
    }

    // Hide owner ID from public response
    const { owner_id, ...property } = rows[0];

    res.status(200).json({ property });
};

export const createProperty = async (req, res, next) => {
    const ownerId = req.user.id;

    const {
        cityId,
        locality,
        rent,
        deposit,
        carpetAreaSqft,
        bedrooms,
        bathrooms,
        floorNo,
        totalFloors,
        furnishing,
        propertyType,
        hasParking = false,
        hasLift = false,
        allowSingleMale = false,
        allowSingleFemale = false,
        allowFamily = false,
        photos = []
    } = req.body;

    const prefix = `/images/user_${req.user.id}_`;
    if (photos.some(p => !p.startsWith(prefix))) {
        return next(new CustomError(400, 'Photos must be uploaded by you'));
    }

    // Generate title from the final property values
    const propertyTypeTitle = propertyType === 'villa' ? 'Villa' : 'Apartment';
    const title = `${bedrooms} BHK ${propertyTypeTitle} in ${locality}`;

    const { rows } = await pool.query(`
        INSERT INTO properties (
            owner_id,
            city_id,
            title,
            locality,
            rent,
            deposit,
            carpet_area_sqft,
            bedrooms,
            bathrooms,
            floor_no,
            total_floors,
            furnishing,
            property_type,
            has_parking,
            has_lift,
            allow_single_male,
            allow_single_female,
            allow_family,
            photos
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        RETURNING *;
    `, [
        ownerId,
        cityId,
        title,
        locality,
        rent,
        deposit,
        carpetAreaSqft,
        bedrooms,
        bathrooms,
        floorNo,
        totalFloors,
        furnishing,
        propertyType,
        hasParking,
        hasLift,
        allowSingleMale,
        allowSingleFemale,
        allowFamily,
        photos
    ]);

    res.status(201).json({
        property: rows[0]
    });
};

export const updateProperty = async (req, res, next) => {
    const { id } = req.params;

    // Property was already fetched and ownership was already verified
    // by normalizePropertyUpdate middleware.
    const existing = req.existingProperty;

    // req.body has already bee// Only delete files in this user's upload namespace (user_<id>_...).
    // Seed/shared images are never unlinked, since other listings may use them.n normalized and validated.
    const {
        cityId,
        locality,
        rent,
        deposit,
        carpetAreaSqft,
        bedrooms,
        bathrooms,
        floorNo,
        totalFloors,
        furnishing,
        propertyType,
        hasParking,
        hasLift,
        allowSingleMale,
        allowSingleFemale,
        allowFamily,
        photos
    } = req.body;

    // Only photos newly added in this request must belong to the owner/caller
    const prefix = `/images/user_${req.user.id}_`;
    const addedPhotos = photos.filter(p => !existing.photos.includes(p));

    if (addedPhotos.some(p => !p.startsWith(prefix))) {
        return next(new CustomError(400, 'Photos must be uploaded by you'));
    }

    // Generate title from the final property values.
    const propertyTypeTitle =
        propertyType === 'villa' ? 'Villa' : 'Apartment';
    const title = `${bedrooms} BHK ${propertyTypeTitle} in ${locality}`;

    // Find photos that were removed from the property.
    const removedPhotos = existing.photos.filter(
        photo => !photos.includes(photo)
    );

    // Update database.
    const updateResult = await pool.query(`
        UPDATE properties
        SET
            city_id = $1,
            title = $2,
            locality = $3,
            rent = $4,
            deposit = $5,
            carpet_area_sqft = $6,
            bedrooms = $7,
            bathrooms = $8,
            floor_no = $9,
            total_floors = $10,
            furnishing = $11,
            property_type = $12,
            has_parking = $13,
            has_lift = $14,
            allow_single_male = $15,
            allow_single_female = $16,
            allow_family = $17,
            photos = $18
        WHERE id = $19
        RETURNING *;
    `, [
        cityId,
        title,
        locality,
        rent,
        deposit,
        carpetAreaSqft,
        bedrooms,
        bathrooms,
        floorNo,
        totalFloors,
        furnishing,
        propertyType,
        hasParking,
        hasLift,
        allowSingleMale,
        allowSingleFemale,
        allowFamily,
        photos,
        id
    ]);

    // Delete removed photos from disk, but only the user's own uploads.
    // Seed/shared images stay, since other listings may still reference them.
    await deletePhotoFiles(removedPhotos.filter(p => p.startsWith(prefix)));

    res.status(200).json({
        property: updateResult.rows[0]
    });
};

export const deleteProperty = async (req, res, next) => {

    const { id } = req.params;
    const userId = req.user.id;

    // Get owner and photos before deleting the row
    const { rows } = await pool.query(
        'SELECT owner_id, photos FROM properties WHERE id = $1',
        [id]
    );

    const property = rows[0];

    if (!property) {
        return next(new CustomError(404, 'Property not found'));
    }

    // Only the owner can delete the property
    if (property.owner_id !== userId) {
        return next(new CustomError(
            403,
            'You can only delete your own properties'
        ));
    }

    // Delete property from database
    await pool.query(
        'DELETE FROM properties WHERE id = $1',
        [id]
    );

    // Only delete files in this user's upload namespace (user_<id>_...).
    // Seed/shared images are never unlinked, since other listings may use them.
    const prefix = `/images/user_${userId}_`;
    await deletePhotoFiles(property.photos.filter(p => p.startsWith(prefix)));

    res.status(200).json({
        message: 'Property deleted successfully'
    });
};