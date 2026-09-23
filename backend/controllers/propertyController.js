import pool from '../db/pool.js';
import CustomError from '../utils/CustomError.js';

export const getProperties = async (req, res, next) => {
    const {
        cityId,
        locationId,
        minRent,
        maxRent,
        rooms,
        bathrooms,
        propertyType,
        furnishing,
        tenantPreference,
        hasHall,
        hasKitchen,
        lift,
        parking,
        sort
    } = req.query;

    const conditions = ['1 = 1'];
    const values = [];

    if (cityId) {
        values.push(cityId);
        conditions.push(`p.city_id = $${values.length}`);
    }

    if (locationId) {
        values.push(locationId);
        conditions.push(`p.location_id = $${values.length}`);
    }

    if (minRent !== undefined) {
        values.push(minRent);
        conditions.push(`p.rent >= $${values.length}`);
    }

    if (maxRent !== undefined) {
        values.push(maxRent);
        conditions.push(`p.rent <= $${values.length}`);
    }

    if (rooms !== undefined) {
        values.push(rooms);
        conditions.push(`p.rooms = $${values.length}`);
    }

    if (bathrooms !== undefined) {
        values.push(bathrooms);
        conditions.push(`p.bathrooms = $${values.length}`);
    }

    if (propertyType) {
        const types = Array.isArray(propertyType) ? propertyType : [propertyType];
        values.push(types);
        conditions.push(`p.property_type = ANY($${values.length}::text[])`);
    }

    if (furnishing) {
        const furnishingList = Array.isArray(furnishing) ? furnishing : [furnishing];
        values.push(furnishingList);
        conditions.push(`p.furnishing = ANY($${values.length}::text[])`);
    }

    // Tenant Preference Asymmetric Search
    if (tenantPreference && tenantPreference !== 'any') {
        values.push([tenantPreference, 'any']);
        conditions.push(`p.tenant_preference = ANY($${values.length}::text[])`);
    }

    // Strict Opt-in Amenities (Only applied when explicitly checked true)
    if (hasHall === true) {
        conditions.push('p.has_hall = true');
    }

    if (hasKitchen === true) {
        conditions.push('p.has_kitchen = true');
    }

    if (lift === true) {
        conditions.push('p.lift = true');
    }

    if (parking === true) {
        conditions.push('p.parking = true');
    }

    // Sorting Clause
    let orderByClause = 'ORDER BY p.rent ASC';
    if (sort === 'rent_desc') {
        orderByClause = 'ORDER BY p.rent DESC';
    } else if (sort === 'newest') {
        orderByClause = 'ORDER BY p.created_at DESC';
    }

    const queryText = `
        SELECT 
            p.*,
            c.name AS city_name,
            l.name AS location_name,
            COALESCE(
                (SELECT pp.image FROM property_photos pp WHERE pp.property_id = p.id LIMIT 1),
                NULL
            ) AS cover_photo
        FROM properties p
        JOIN cities c ON p.city_id = c.id
        JOIN locations l ON p.location_id = l.id
        WHERE ${conditions.join(' AND ')}
        ${orderByClause}
        LIMIT 80;
    `;

    const { rows } = await pool.query(queryText, values);

    res.status(200).json({
        count: rows.length,
        properties: rows
    });
};

export const getProperty = async (req, res, next) => {
    const { id } = req.params;

    const queryText = `
        SELECT 
            p.*,
            c.name AS city_name,
            l.name AS location_name,
            up.name AS owner_name,
            up.phone AS owner_phone,
            COALESCE(
                ARRAY_AGG(pp.image) FILTER (WHERE pp.image IS NOT NULL),
                '{}'
            ) AS photos
        FROM properties p
        JOIN cities c ON p.city_id = c.id
        JOIN locations l ON p.location_id = l.id
        LEFT JOIN user_profiles up ON p.owner_id = up.user_id
        LEFT JOIN property_photos pp ON p.id = pp.property_id
        WHERE p.id = $1
        GROUP BY p.id, c.name, l.name, up.name, up.phone;
    `;

    const { rows } = await pool.query(queryText, [id]);

    if (rows.length === 0) {
        return next(new CustomError(404, 'Property not found'));
    }

    res.status(200).json({
        property: rows[0]
    });
};

export const createProperty = async (req, res, next) => {
    const client = await pool.connect();

    try {
        const ownerId = req.user.id;
        let {
            cityId,
            locationId,
            description,
            rent,
            maintenance,
            rooms,
            bathrooms,
            hasHall,
            hasKitchen,
            propertyType,
            tenantPreference,
            furnishing,
            floor,
            totalFloors,
            lift,
            parking,
            photos
        } = req.body;

        await client.query('BEGIN');

        // Auto-generate description if not provided
        if (!description || description.trim() === '') {
            const locResult = await client.query(
                `SELECT l.name AS location_name, c.name AS city_name
                 FROM locations l
                 JOIN cities c ON l.city_id = c.id
                 WHERE l.id = $1`,
                [locationId]
            );

            if (locResult.rows.length > 0) {
                const { location_name, city_name } = locResult.rows[0];
                description = `${rooms} BHK ${propertyType} available for rent in ${location_name}, ${city_name}.`;
            } else {
                description = `${rooms} BHK ${propertyType} available for rent.`;
            }
        }

        const propertyInsertQuery = `
            INSERT INTO properties (
                owner_id, city_id, location_id, description, rent, maintenance,
                rooms, bathrooms, has_hall, has_kitchen, property_type, tenant_preference,
                furnishing, floor, total_floors, lift, parking
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            ) RETURNING *;
        `;

        const propertyValues = [
            ownerId,
            cityId,
            locationId,
            description,
            rent,
            maintenance,
            rooms,
            bathrooms,
            hasHall,
            hasKitchen,
            propertyType,
            tenantPreference,
            furnishing,
            floor,
            totalFloors,
            lift,
            parking
        ];

        const { rows: propertyRows } = await client.query(propertyInsertQuery, propertyValues);
        const createdProperty = propertyRows[0];

        let insertedPhotos = [];
        if (photos && photos.length > 0) {
            const photoInsertQuery = `
                INSERT INTO property_photos (property_id, image)
                SELECT $1, unnest($2::text[])
                RETURNING image;
            `;
            const { rows: photoRows } = await client.query(photoInsertQuery, [
                createdProperty.id,
                photos
            ]);
            insertedPhotos = photoRows.map(r => r.image);
        }

        await client.query('COMMIT');

        res.status(201).json({
            property: {
                ...createdProperty,
                photos: insertedPhotos
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);

    } finally {
        client.release();
    }
};