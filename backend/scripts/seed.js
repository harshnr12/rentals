import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../db/pool.js';

const cities = [
    {
        name: 'Delhi',
        baseRent: 20000,
        locations: ['Rohini', 'Dwarka', 'Saket', 'Vasant Kunj', 'Laxmi Nagar']
    },
    {
        name: 'Mumbai',
        baseRent: 28000,
        locations: ['Andheri', 'Bandra', 'Powai', 'Borivali', 'Thane']
    },
    {
        name: 'Pune',
        baseRent: 17000,
        locations: ['Kothrud', 'Baner', 'Wakad', 'Viman Nagar', 'Hinjewadi']
    },
    {
        name: 'Bengaluru',
        baseRent: 21000,
        locations: ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City']
    },
    {
        name: 'Chennai',
        baseRent: 16000,
        locations: ['Adyar', 'Velachery', 'Anna Nagar', 'T Nagar', 'Tambaram']
    },
    {
        name: 'Hyderabad',
        baseRent: 17000,
        locations: ['Madhapur', 'Gachibowli', 'Kondapur', 'Banjara Hills', 'Kukatpally']
    },
    {
        name: 'Kolkata',
        baseRent: 14000,
        locations: ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Dum Dum']
    },
    {
        name: 'Jaipur',
        baseRent: 13000,
        locations: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C Scheme', 'Jagatpura']
    }
];


const users = [
    {
        name: 'Rakesh',
        email: 'rakesh@example.com',
        phone: '9876500001'
    },
    {
        name: 'Amit',
        email: 'amit@example.com',
        phone: '9876500002'
    },
    {
        name: 'Neha',
        email: 'neha@example.com',
        phone: '9876500003'
    },
    {
        name: 'Pooja',
        email: 'pooja@example.com',
        phone: '9876500004'
    },
    {
        name: 'Rahul',
        email: 'rahul@example.com',
        phone: '9876500005'
    }
];


const propertyTemplates = [
    {
        rooms: 3,
        propertyType: 'flat',
        tenantPreference: 'family',
        furnishing: 'semi_furnished',
        floor: 6,
        totalFloors: 10,
        lift: true,
        parking: true,
        multiplier: 1.20
    },
    {
        rooms: 2,
        propertyType: 'flat',
        tenantPreference: 'any',
        furnishing: 'fully_furnished',
        floor: 8,
        totalFloors: 12,
        lift: true,
        parking: true,
        multiplier: 1.00
    },
    {
        rooms: 4,
        propertyType: 'house',
        tenantPreference: 'family',
        furnishing: 'unfurnished',
        floor: 0,
        totalFloors: 2,
        lift: false,
        parking: true,
        multiplier: 1.45
    },
    {
        rooms: 2,
        propertyType: 'builder_floor',
        tenantPreference: 'any',
        furnishing: 'semi_furnished',
        floor: 0,
        totalFloors: 4,
        lift: false,
        parking: true,
        multiplier: 0.95
    },
    {
        rooms: 3,
        propertyType: 'flat',
        tenantPreference: 'family',
        furnishing: 'fully_furnished',
        floor: 12,
        totalFloors: 18,
        lift: true,
        parking: true,
        multiplier: 1.35
    },
    {
        rooms: 4,
        propertyType: 'villa',
        tenantPreference: 'any',
        furnishing: 'semi_furnished',
        floor: 0,
        totalFloors: 2,
        lift: false,
        parking: true,
        multiplier: 1.60
    },
    {
        rooms: 1,
        propertyType: 'flat',
        tenantPreference: 'bachelors',
        furnishing: 'unfurnished',
        floor: 7,
        totalFloors: 10,
        lift: true,
        parking: false,
        multiplier: 0.75
    },
    {
        rooms: 3,
        propertyType: 'duplex',
        tenantPreference: 'family',
        furnishing: 'semi_furnished',
        floor: 0,
        totalFloors: 3,
        lift: false,
        parking: true,
        multiplier: 1.40
    },
    {
        rooms: 4,
        propertyType: 'flat',
        tenantPreference: 'any',
        furnishing: 'fully_furnished',
        floor: 18,
        totalFloors: 24,
        lift: true,
        parking: true,
        multiplier: 1.55
    },
    {
        rooms: 2,
        propertyType: 'flat',
        tenantPreference: 'bachelors',
        furnishing: 'semi_furnished',
        floor: 9,
        totalFloors: 15,
        lift: true,
        parking: false,
        multiplier: 0.90
    },
    {
        rooms: 3,
        propertyType: 'flat',
        tenantPreference: 'family',
        furnishing: 'unfurnished',
        floor: 15,
        totalFloors: 20,
        lift: true,
        parking: true,
        multiplier: 1.10
    },
    {
        rooms: 1,
        propertyType: 'flat',
        tenantPreference: 'bachelors',
        furnishing: 'fully_furnished',
        floor: 5,
        totalFloors: 8,
        lift: true,
        parking: false,
        multiplier: 0.85
    },
    {
        rooms: 4,
        propertyType: 'house',
        tenantPreference: 'family',
        furnishing: 'semi_furnished',
        floor: 0,
        totalFloors: 2,
        lift: false,
        parking: true,
        multiplier: 1.50
    },
    {
        rooms: 2,
        propertyType: 'flat',
        tenantPreference: 'any',
        furnishing: 'unfurnished',
        floor: 22,
        totalFloors: 30,
        lift: true,
        parking: true,
        multiplier: 1.05
    },
    {
        rooms: 3,
        propertyType: 'flat',
        tenantPreference: 'family',
        furnishing: 'fully_furnished',
        floor: 28,
        totalFloors: 30,
        lift: true,
        parking: true,
        multiplier: 1.45
    }
];


const photoSets = [
    ['1_1.jpg', '1_2.jpg', '1_3.jpg'],
    ['2_1.jpg', '2_2.jpg'],
    ['3_1.jpg', '3_2.jpg'],
    ['4_1.jpg', '4_2.jpg'],
    ['5_1.jpg', '5_2.jpg']
];


const seed = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        /*
         * Clear existing seed data.
         * CASCADE also removes dependent records.
         */
        await client.query(`
            TRUNCATE
                notifications,
                favorites,
                property_photos,
                properties,
                locations,
                cities,
                user_profiles,
                users
            RESTART IDENTITY CASCADE
        `);

        console.log('Existing data cleared.');

        // =========================================
        // USERS
        // =========================================

        const passwordHash = await bcrypt.hash('test1234', 10);

        const userIds = [];

        for (const user of users) {
            const result = await client.query(
                `
                INSERT INTO users (email, password_hash)
                VALUES ($1, $2)
                RETURNING id
                `,
                [user.email, passwordHash]
            );

            const userId = result.rows[0].id;

            userIds.push(userId);

            await client.query(
                `
                INSERT INTO user_profiles (user_id, name, phone)
                VALUES ($1, $2, $3)
                `,
                [userId, user.name, user.phone]
            );
        }

        console.log(`Inserted ${userIds.length} users.`);


        // =========================================
        // CITIES + LOCATIONS + PROPERTIES
        // =========================================

        let propertyNumber = 1;

        for (const city of cities) {

            const cityResult = await client.query(
                `
                INSERT INTO cities (name)
                VALUES ($1)
                RETURNING id
                `,
                [city.name]
            );

            const cityId = cityResult.rows[0].id;


            for (const locationName of city.locations) {

                const locationResult = await client.query(
                    `
                    INSERT INTO locations (city_id, name)
                    VALUES ($1, $2)
                    RETURNING id
                    `,
                    [cityId, locationName]
                );

                const locationId = locationResult.rows[0].id;


                /*
                 * Three properties per locality.
                 *
                 * We use templates cyclically:
                 * property 1 -> template 1
                 * property 2 -> template 2
                 * property 3 -> template 3
                 * ...
                 */

                for (let i = 0; i < 3; i++) {

                    const templateIndex = (propertyNumber - 1) % propertyTemplates.length;

                    const template = propertyTemplates[templateIndex];

                    const ownerId = userIds[(propertyNumber - 1) % userIds.length];

                    const rent = Math.round(
                        city.baseRent * template.multiplier
                    );

                    const maintenance = Math.round(
                        rent * 0.08
                    );

                    const description =
                        `${template.rooms} BHK property available in ${locationName}, ${city.name}. ` +
                        `Suitable for comfortable residential living.`;


                    const propertyResult = await client.query(
                        `
                        INSERT INTO properties (
                            owner_id,
                            city_id,
                            location_id,
                            description,
                            rent,
                            maintenance,
                            rooms,
                            has_hall,
                            has_kitchen,
                            property_type,
                            tenant_preference,
                            furnishing,
                            floor,
                            total_floors,
                            lift,
                            parking
                        )
                        VALUES (
                            $1, $2, $3, $4, $5, $6, $7,
                            $8, $9, $10, $11, $12, $13, $14, $15, $16
                        )
                        RETURNING id
                        `,
                        [
                            ownerId,
                            cityId,
                            locationId,
                            description,
                            rent,
                            maintenance,
                            template.rooms,
                            true,
                            true,
                            template.propertyType,
                            template.tenantPreference,
                            template.furnishing,
                            template.floor,
                            template.totalFloors,
                            template.lift,
                            template.parking
                        ]
                    );

                    const propertyId = propertyResult.rows[0].id;


                    // =========================================
                    // PROPERTY PHOTOS
                    // =========================================

                    const photos = photoSets[
                        (propertyNumber - 1) % photoSets.length
                    ];

                    for (const image of photos) {
                        await client.query(
                            `
                            INSERT INTO property_photos (
                                property_id,
                                image
                            )
                            VALUES ($1, $2)
                            `,
                            [propertyId, image]
                        );
                    }

                    propertyNumber++;
                }
            }
        }

        await client.query('COMMIT');

        console.log('Seed completed successfully.');
        console.log(`Cities: ${cities.length}`);
        console.log(`Locations: ${cities.length * 5}`);
        console.log(`Properties: ${propertyNumber - 1}`);
        console.log('Demo password: test1234');

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Seed failed:', error);

    } finally {
        client.release();
        await pool.end();
    }
};


seed();