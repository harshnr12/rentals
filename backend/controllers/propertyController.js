import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';


/**
*GET /properties
    → property listings + city name
    → no owner contact info

*GET /properties/:id
    → property details + city name
    → no owner name/phone

*GET /properties/:id/contact
    → LOGIN REQUIRED
    → owner name + phone
    → increments contact_views_count
*/

export const getProperties = async (req, res, next) => {
    const { cityId, locality, minRent, maxRent, bedrooms, propertyType, sort } = req.query;

    const conditions = ['1 = 1'];
    const values = [];

    if (cityId) {
        values.push(cityId);
        conditions.push(`p.city_id = $${values.length}`);
    }

    if (locality) {
        values.push(`%${locality}%`);
        conditions.push(`p.locality ILIKE $${values.length}`);
    }

    if (minRent !== undefined) {
        values.push(minRent);
        conditions.push(`p.rent >= $${values.length}`);
    }

    if (maxRent !== undefined) {
        values.push(maxRent);
        conditions.push(`p.rent <= $${values.length}`);
    }

    if (bedrooms !== undefined) {
        values.push(bedrooms);
        conditions.push(`p.bedrooms = $${values.length}`);
    }

    if (propertyType) {
        values.push(propertyType);
        conditions.push(`p.property_type = $${values.length}`);
    }

    let orderBy = 'ORDER BY p.created_at DESC';

    if (sort === 'rent_asc') orderBy = 'ORDER BY p.rent ASC';
    if (sort === 'rent_desc') orderBy = 'ORDER BY p.rent DESC';
    if (sort === 'newest') orderBy = 'ORDER BY p.created_at DESC';

    const query = `
        SELECT p.*, c.name AS city_name 
        FROM properties p
        JOIN cities c ON p.city_id = c.id
        WHERE ${conditions.join(' AND ')}
        ${orderBy}
        LIMIT 120;
    `;

    const { rows } = await pool.query(query, values);

    res.status(200).json({
        count: rows.length,
        properties: rows
    });
};

export const getProperty = async (req, res, next) => {
    const { rows } = await pool.query(`
        SELECT 
            p.*,
            c.name AS city_name
        FROM properties p
        JOIN cities c ON p.city_id = c.id
        WHERE p.id = $1
    `, [req.params.id]);

    if (rows.length === 0) {
        return next(new CustomError(404, 'Property not found'));
    }

    res.status(200).json({
        property: rows[0]
    });
};

export const getPropertyContact = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const { rows } = await pool.query(`
        SELECT 
            u.name AS owner_name,
            u.phone AS owner_phone
        FROM properties p
        JOIN users u ON p.owner_id = u.id
        WHERE p.id = $1
    `, [id]);

    if (rows.length === 0) {
        return next(new CustomError(404, 'Property not found'));
    }

    await pool.query(`
        UPDATE users
        SET contact_views_count = contact_views_count + 1
        WHERE id = $1
    `, [userId]);

    res.status(200).json({
        owner: rows[0]
    });
};

export const createProperty = async (req, res, next) => {
    const ownerId = req.user.id;

    const {
        cityId,
        title,
        locality,
        rent,
        deposit,
        carpetAreaSqft,
        bedrooms,
        bathrooms,
        floorNo,
        furnishing,
        propertyType,
        hasParking,
        hasLift,
        photos
    } = req.body;

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
            furnishing,
            property_type,
            has_parking,
            has_lift,
            photos
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15
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
        furnishing,
        propertyType,
        hasParking,
        hasLift,
        photos || []
    ]);

    res.status(201).json({
        property: rows[0]
    });
};

export const updateProperty = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const { rows } = await pool.query(
        'SELECT * FROM properties WHERE id = $1',
        [id]
    );

    const existing = rows[0];

    if (!existing) {
        return next(new CustomError(404, 'Property not found'));
    }

    if (existing.owner_id !== userId) {
        return next(new CustomError(
            403,
            'You can only update your own properties'
        ));
    }

    const cityId = req.body.cityId ?? existing.city_id;
    const title = req.body.title ?? existing.title;
    const locality = req.body.locality ?? existing.locality;
    const rent = req.body.rent ?? existing.rent;
    const deposit = req.body.deposit ?? existing.deposit;
    const carpetAreaSqft = req.body.carpetAreaSqft ?? existing.carpet_area_sqft;
    const bedrooms = req.body.bedrooms ?? existing.bedrooms;
    const bathrooms = req.body.bathrooms ?? existing.bathrooms;
    const floorNo = req.body.floorNo ?? existing.floor_no;
    const furnishing = req.body.furnishing ?? existing.furnishing;
    const propertyType = req.body.propertyType ?? existing.property_type;
    const hasParking = req.body.hasParking ?? existing.has_parking;
    const hasLift = req.body.hasLift ?? existing.has_lift;
    const photos = req.body.photos ?? existing.photos;

    const updateResult = await pool.query(`
        UPDATE properties SET
            city_id = $1,
            title = $2,
            locality = $3,
            rent = $4,
            deposit = $5,
            carpet_area_sqft = $6,
            bedrooms = $7,
            bathrooms = $8,
            floor_no = $9,
            furnishing = $10,
            property_type = $11,
            has_parking = $12,
            has_lift = $13,
            photos = $14
        WHERE id = $15
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
        furnishing,
        propertyType,
        hasParking,
        hasLift,
        photos,
        id
    ]);

    res.status(200).json({
        property: updateResult.rows[0]
    });
};

export const deleteProperty = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const propCheck = await pool.query(
        'SELECT owner_id FROM properties WHERE id = $1',
        [id]
    );

    if (propCheck.rows.length === 0) {
        return next(new CustomError(404, 'Property not found'));
    }

    if (propCheck.rows[0].owner_id !== userId) {
        return next(new CustomError(
            403,
            'You can only delete your own properties'
        ));
    }

    await pool.query(
        'DELETE FROM properties WHERE id = $1',
        [id]
    );

    res.status(200).json({
        message: 'Property deleted successfully'
    });
};