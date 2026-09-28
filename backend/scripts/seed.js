import 'dotenv/config';

import bcrypt from 'bcrypt';

import pool from '../db/pool.js';

// ============================================================================
// 1. REGIONAL CITIES, BENCHMARK BASE RENTS & LOCALITIES
// ============================================================================

// Base rents reflect benchmark 2 BHK rates.
// Localities feature realistic price weighting multipliers.
//
// Owners pool: ~70% male, ~30% female with region-authentic surnames.

const CITIES_CONFIG = [
    {
        name: 'Delhi',
        baseRent: 21000,
        depositMonths: [1, 2], // 1-2 months deposit convention in Delhi NCR

        localities: [
            { name: 'Rohini', mult: 0.90 },
            { name: 'Dwarka', mult: 1.05 },
            { name: 'Janakpuri', mult: 1.00 },
            { name: 'Saket', mult: 1.25 },
            { name: 'Mayur Vihar', mult: 0.95 }
        ],

        owners: {
            male: [
                'Vikram',
                'Aman',
                'Gaurav',
                'Harpreet',
                'Rohan',
                'Rajiv',
                'Deepak',
                'Jaswinder',
                'Kapil',
                'Varun'
            ],

            female: [
                'Sunita',
                'Pooja',
                'Ritu',
                'Simran'
            ],

            surnames: [
                'Batra',
                'Juneja',
                'Kataria',
                'Malhotra',
                'Aggarwal',
                'Kapoor',
                'Bhasin',
                'Bhatia'
            ]
        }
    },

    {
        name: 'Mumbai',
        baseRent: 32000,
        depositMonths: [2, 4], // 2-4 months deposit convention

        localities: [
            { name: 'Ghatkopar East', mult: 0.90 },
            { name: 'Versova', mult: 1.15 },
            { name: 'Powai', mult: 1.20 },
            { name: 'Juhu', mult: 1.40 },
            { name: 'Pali Hill', mult: 1.55 }
        ],

        owners: {
            male: [
                'Milind',
                'Sachin',
                'Pradeep',
                'Nitin',
                'Rohit',
                'Santosh',
                'Ajay',
                'Devendra',
                'Girish',
                'Rajesh'
            ],

            female: [
                'Ketaki',
                'Snehal',
                'Pooja',
                'Smita'
            ],

            surnames: [
                'Kulkarni',
                'Deshmukh',
                'Shah',
                'Mehta',
                'Patil',
                'Bhosale',
                'Pawar',
                'Fernandes'
            ]
        }
    },

    {
        name: 'Bengaluru',
        baseRent: 25000,
        depositMonths: [5, 7], // 5-7 months heavy deposit convention

        localities: [
            { name: 'Electronic City', mult: 0.85 },
            { name: 'Whitefield', mult: 1.05 },
            { name: 'HSR Layout', mult: 1.20 },
            { name: 'Koramangala', mult: 1.35 },
            { name: 'Indiranagar', mult: 1.40 }
        ],

        owners: {
            male: [
                'Manjunath',
                'Suresh',
                'Venkatesh',
                'Karthik',
                'Prashanth',
                'Nagaraj',
                'Ramesh',
                'Girish',
                'Chetan',
                'Anand'
            ],

            female: [
                'Deepa',
                'Ramya',
                'Anupama',
                'Roopa'
            ],

            surnames: [
                'Gowda',
                'Hegde',
                'Shetty',
                'Rao',
                'Reddy',
                'Bhat',
                'Murthy',
                'Nayak'
            ]
        }
    },

    {
        name: 'Pune',
        baseRent: 20000,
        depositMonths: [2, 3], // 2-3 months deposit

        localities: [
            { name: 'Wagholi', mult: 0.80 },
            { name: 'Hinjewadi', mult: 0.95 },
            { name: 'Kothrud', mult: 1.05 },
            { name: 'Baner', mult: 1.15 },
            { name: 'Deccan', mult: 1.20 }
        ],

        owners: {
            male: [
                'Makarand',
                'Anand',
                'Ganesh',
                'Swapnil',
                'Shridhar',
                'Prashant',
                'Hemant',
                'Vinayak',
                'Mahesh',
                'Abhay'
            ],

            female: [
                'Suvarna',
                'Vaishali',
                'Tanvi',
                'Shruti'
            ],

            surnames: [
                'Deshpande',
                'Kulkarni',
                'Joshi',
                'Bapat',
                'Gokhale',
                'Bhosale',
                'Karmarkar',
                'Shinde'
            ]
        }
    },

    {
        name: 'Hyderabad',
        baseRent: 19000,
        depositMonths: [2, 3], // 2-3 months deposit

        localities: [
            { name: 'Miyapur', mult: 0.85 },
            { name: 'Kukatpally', mult: 0.95 },
            { name: 'Kondapur', mult: 1.10 },
            { name: 'Madhapur', mult: 1.25 },
            { name: 'Gachibowli', mult: 1.30 }
        ],

        owners: {
            male: [
                'Srinivas',
                'Venkat',
                'Rajesh',
                'Harish',
                'Vamsi',
                'Chandra',
                'Kalyan',
                'Naveen',
                'Satish',
                'Prasad'
            ],

            female: [
                'Madhavi',
                'Kavitha',
                'Swathi',
                'Sravani'
            ],

            surnames: [
                'Reddy',
                'Rao',
                'Chowdary',
                'Goud',
                'Varma',
                'Raju',
                'Kamineni',
                'Mamidala'
            ]
        }
    },

    {
        name: 'Jaipur',
        baseRent: 12500,
        depositMonths: [1, 2], // 1-2 months deposit

        localities: [
            { name: 'Tonk Road', mult: 0.90 },
            { name: 'Jagatpura', mult: 0.95 },
            { name: 'Mansarovar', mult: 1.00 },
            { name: 'Malviya Nagar', mult: 1.15 },
            { name: 'Vaishali Nagar', mult: 1.20 }
        ],

        owners: {
            male: [
                'Gajendra',
                'Lalit',
                'Surendra',
                'Narendra',
                'Mukesh',
                'Rajendra',
                'Dinesh',
                'Kailash',
                'Mahendra',
                'Jitendra'
            ],

            female: [
                'Mamta',
                'Priyanka',
                'Anuradha',
                'Sunita',
                'Meenakshi',
                'Rekha'
            ],

            surnames: [
                'Khandelwal',
                'Shekhawat',
                'Agarwal',
                'Meena',
                'Rathore',
                'Maheshwari',
                'Joshi',
                'Choudhary'
            ]
        }
    },

    {
        name: 'Indore',
        baseRent: 13000,
        depositMonths: [1, 2], // 1-2 months deposit

        localities: [
            { name: 'Geeta Bhawan', mult: 0.90 },
            { name: 'MR 10', mult: 0.95 },
            { name: 'Palasia', mult: 1.05 },
            { name: 'Vijay Nagar', mult: 1.15 },
            { name: 'Nipania', mult: 1.20 }
        ],

        owners: {
            male: [
                'Pramod',
                'Kamal',
                'Dharmendra',
                'Ashok',
                'Sanjay',
                'Gopal',
                'Omprakash',
                'Vinod',
                'Jagdish',
                'Rupesh'
            ],

            female: [
                'Neelam',
                'Shikha',
                'Rashmi',
                'Preeti'
            ],

            surnames: [
                'Jain',
                'Patel',
                'Sharma',
                'Agarwal',
                'Porwal',
                'Gupta',
                'Joshi',
                'Choudhary'
            ]
        }
    },

    {
        name: 'Bhopal',
        baseRent: 12000,
        depositMonths: [1, 1], // Central MP 1 month flat deposit

        localities: [
            { name: 'Ayodhya Bypass', mult: 0.85 },
            { name: 'Indrapuri', mult: 0.90 },
            { name: 'Kolar Road', mult: 0.95 },
            { name: 'Hoshangabad Road', mult: 1.05 },
            { name: 'Arera Colony', mult: 1.30 }
        ],

        owners: {
            male: [
                'Alok',
                'Sanjeev',
                'Devendra',
                'Rakesh',
                'Manoj',
                'Pradeep',
                'Arun',
                'Brijesh',
                'Sudhir',
                'Hemant'
            ],

            female: [
                'Vandana',
                'Archana',
                'Manju',
                'Sadhna',
                'Preeti'
            ],

            surnames: [
                'Sharma',
                'Raghuwanshi',
                'Namdev',
                'Saxena',
                'Srivastava',
                'Gupta',
                'Verma',
                'Jain'
            ]
        }
    }
];

// ============================================================================
// 2. TENANT DEMO PROFILES
// ============================================================================

// Dedicated login/demo profiles used for API and frontend testing.
//
// These five users intentionally use IDs 1001-1005 so they remain clearly
// separate from the 120 seeded property-owner accounts.
//
// OVERRIDING SYSTEM VALUE is used during insertion so these explicit IDs do
// not move the normal PostgreSQL users identity sequence.
//
// Therefore, after seeding:
// - Property owners use IDs 1-120
// - Demo/test users use IDs 1001-1005
// - The next normal signup receives ID 121

const TENANTS = [
    {
        id: 1001,
        name: 'Aarav Nair',
        email: 'aarav_nair@gmail.com',
        phone: '9820011001',
    },

    {
        id: 1002,
        name: 'Nikhil Thapar',
        email: 'nikhil_thapar@gmail.com',
        phone: '9820011002',
    },

    {
        id: 1003,
        name: 'Kavya Pillai',
        email: 'kavya_pillai@gmail.com',
        phone: '9820011003',
    },

    {
        id: 1004,
        name: 'Siddharth Menon',
        email: 'siddharth_menon@gmail.com',
        phone: '9820011004',
    },

    {
        id: 1005,
        name: 'Mayank Bisht',
        email: 'mayank_bisht@gmail.com',
        phone: '9820011005',
    }
];

// ============================================================================
// 3. PROPERTY SPECIFICATIONS & CARPET AREA RULES
// ============================================================================

// 4 BHK units represent ground-floor luxury villas (floor 0).

const PROPERTY_TEMPLATES = [
    {
        bhk: 1,
        mult: 0.70,
        carpetMin: 380,
        carpetMax: 500,
        bathrooms: 1,
        furnishing: 'unfurnished',
        floor: 2,
        totalFloors: 5,
        allowSingleMale: true,
        allowSingleFemale: true,
        allowFamily: false
    },

    {
        bhk: 2,
        mult: 1.00,
        carpetMin: 700,
        carpetMax: 880,
        bathrooms: 2,
        furnishing: 'semi_furnished',
        floor: 4,
        totalFloors: 7,
        allowSingleMale: true,
        allowSingleFemale: true,
        allowFamily: true
    },

    {
        bhk: 2,
        mult: 1.15,
        carpetMin: 750,
        carpetMax: 920,
        bathrooms: 2,
        furnishing: 'fully_furnished',
        floor: 7,
        totalFloors: 10,
        allowSingleMale: false,  // (Strict family only)
        allowSingleFemale: false,
        allowFamily: true
    },

    {
        bhk: 3,
        mult: 1.45,
        carpetMin: 1150,
        carpetMax: 1350,
        bathrooms: 3,
        furnishing: 'semi_furnished',
        floor: 5,
        totalFloors: 8,
        allowSingleMale: true,
        allowSingleFemale: true,
        allowFamily: true
    },

    {
        bhk: 3,
        mult: 1.60,
        carpetMin: 1200,
        carpetMax: 1450,
        bathrooms: 3,
        furnishing: 'fully_furnished',
        floor: 9,
        totalFloors: 15,
        allowSingleMale: false,  // (Strict family only)
        allowSingleFemale: false,
        allowFamily: true
    },

    {
        bhk: 4,
        mult: 2.10,
        carpetMin: 1850,
        carpetMax: 2300,
        bathrooms: 4,
        furnishing: 'fully_furnished',
        floor: 0,
        totalFloors: 2,
        allowSingleMale: false,
        allowSingleFemale: false,
        allowFamily: true
    } // Villa
];

// ============================================================================
// 4. PHOTO SETS CONFIGURATION
// ============================================================================

// Expandable arrays mapping directly to static file names in
// backend/public/images.
//
// The files are served through:
// app.use(express.static(path.join(import.meta.dirname, 'public')))
//
// Therefore:
// public/images/1_1.jpg
//              ↓
// /images/1_1.jpg

const photoSets = [
    ['1_1.jpg', '1_2.jpg', '1_3.jpg'],
    ['2_1.jpg', '2_2.jpg'],
    ['3_1.jpg', '3_2.jpg'],
    ['4_1.jpg', '4_2.jpg'],
    ['5_1.jpg', '5_2.jpg']
];

// ============================================================================
// SEED EXECUTION
// ============================================================================

async function seed() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Resetting existing database tables...');

        // Reset all seed-managed tables before inserting fresh test data.
        // CASCADE handles dependent rows
        // RESTART IDENTITY resets normal PostgreSQL identity sequences.
        // Contact history is intentionally cleared during a fresh seed.
        // New contacted_properties rows are created only when the contact
        // endpoint is actually used.
        await client.query(`
            TRUNCATE
                favorites,
                contacted_properties,
                properties,
                users,
                cities
            RESTART IDENTITY CASCADE
        `);
        const defaultPasswordHash = await bcrypt.hash('test1234', 10);

        let globalPhoneCounter = 9811001001;
        let globalPropertyIndex = 0;

        const insertedPropertyIds = [];
        const tenantIds = [];

        // ------------------------------------------------------------------------
        // 5. Insert Cities, Regional Owners & Properties (120 listings)
        // ------------------------------------------------------------------------

        for (const city of CITIES_CONFIG) {
            console.log(
                `Seeding properties and owners for ${city.name}...`
            );

            const cityRes = await client.query(
                `INSERT INTO cities (name)
                 VALUES ($1)
                 RETURNING id`,
                [city.name]
            );

            const cityId = cityRes.rows[0].id;

            // 15 properties per city -> 15 distinct 1:1 owner profiles.
            const cityOwnerIds = [];

            for (let i = 0; i < 15; i++) {
                // Deterministic ~70% male / ~30% female split.
                const isFemale = i % 3 === 2;

                const firstName = isFemale
                    ? city.owners.female[
                    Math.floor(i / 3) %
                    city.owners.female.length
                    ]
                    : city.owners.male[
                    i % city.owners.male.length
                    ];

                const lastName =
                    city.owners.surnames[
                    i % city.owners.surnames.length
                    ];

                const fullName = `${firstName} ${lastName}`;

                // Safe email naming format
                // (e.g. vikram_batra@gmail.com).
                const emailSuffix = i >= 8 ? `${i}` : '';

                const email =
                    `${firstName.toLowerCase()}_` +
                    `${lastName.toLowerCase()}${emailSuffix}@gmail.com`;

                const phone = `+91 ${globalPhoneCounter++}`;

                const ownerRes = await client.query(
                    `INSERT INTO users (
                        name,
                        email,
                        password_hash,
                        phone
                    )
                    VALUES ($1, $2, $3, $4)
                    RETURNING id`,
                    [
                        fullName,
                        email,
                        defaultPasswordHash,
                        phone
                    ]
                );
                cityOwnerIds.push(ownerRes.rows[0].id);
            }

            // Generate 3 properties per locality
            // (5 localities * 3 = 15 listings per city).
            let cityPropCounter = 0;

            for (const locality of city.localities) {
                for (let unitIdx = 0; unitIdx < 3; unitIdx++) {
                    const ownerId =
                        cityOwnerIds[cityPropCounter];

                    // Make 4 BHK rare:
                    // only 1 villa per city in the most expensive locality.
                    let template;

                    if (
                        unitIdx === 0 &&
                        locality.mult ===
                        Math.max(
                            ...city.localities.map(
                                l => l.mult
                            )
                        )
                    ) {
                        template = PROPERTY_TEMPLATES[5];
                    } else {
                        template =
                            PROPERTY_TEMPLATES[
                            cityPropCounter %
                            (PROPERTY_TEMPLATES.length - 1)
                            ];
                    }

                    // Rent calculation rounded to nearest ₹500.
                    const rawRent =
                        city.baseRent *
                        locality.mult *
                        template.mult;

                    const rent =
                        Math.round(rawRent / 500) * 500;

                    // Deposit calculation based on city conventions.
                    const [minDepMonths, maxDepMonths] =
                        city.depositMonths;

                    const depositMonths =
                        minDepMonths === maxDepMonths
                            ? minDepMonths
                            : minDepMonths +
                            (cityPropCounter % 2) *
                            (maxDepMonths - minDepMonths);

                    const deposit =
                        rent * depositMonths;

                    // Deterministic carpet area calculation.
                    const carpetArea =
                        template.carpetMin +
                        ((cityPropCounter * 31) %
                            (template.carpetMax -
                                template.carpetMin));

                    // Photo paths resolved through the existing static
                    // public/images directory.
                    const chosenSet =
                        photoSets[
                        globalPropertyIndex %
                        photoSets.length
                        ];

                    const photos = chosenSet.map(
                        filename => `/images/${filename}`
                    );

                    const isVilla =
                        template.bhk === 4;

                    // Keep seeded titles consistent with createProperty().
                    // Example: "2 BHK Apartment in Rohini".
                    const title =
                        `${template.bhk} BHK ` +
                        `${isVilla ? 'Villa' : 'Apartment'} ` +
                        `in ${locality.name}`;

                    //  total_floors and allow_ * booleans mapped from templates
                    const propRes = await client.query(
                        `INSERT INTO properties (
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
                            $1, $2, $3, $4, $5, $6, $7, $8,
                            $9, $10, $11, $12, $13, $14, $15,
                            $16, $17, $18, $19
                        )
                        RETURNING id`,
                        [
                            ownerId,
                            cityId,
                            title,
                            locality.name,
                            rent,
                            deposit,
                            carpetArea,
                            template.bhk,
                            template.bathrooms,
                            template.floor,
                            template.totalFloors,
                            template.furnishing,
                            isVilla
                                ? 'villa'
                                : 'apartment',
                            true,
                            template.floor > 1,
                            template.allowSingleMale,
                            template.allowSingleFemale,
                            template.allowFamily,
                            photos
                        ]
                    );

                    insertedPropertyIds.push(
                        propRes.rows[0].id
                    );

                    cityPropCounter++;
                    globalPropertyIndex++;
                }
            }
        }

        // ------------------------------------------------------------------------
        // 6. Insert 5 Dedicated Tenant Accounts
        // ------------------------------------------------------------------------

        // Demo/test users use explicit IDs 1001-1005.
        //
        // OVERRIDING SYSTEM VALUE allows explicit values in a
        // GENERATED ALWAYS AS IDENTITY column without changing the
        // normal PostgreSQL identity sequence.
        //
        // Therefore, the identity sequence remains at 120 and the next
        // normal signup will receive ID 121.

        console.log('Inserting 5 dedicated tenant/demo accounts...');

        for (const tenant of TENANTS) {

            const tenantRes = await client.query(
                `INSERT INTO users (
                    id,
                    name,
                    email,
                    password_hash,
                    phone
                )
                OVERRIDING SYSTEM VALUE
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id`,
                [
                    tenant.id,
                    tenant.name,
                    tenant.email,
                    defaultPasswordHash,
                    tenant.phone
                ]
            );

            tenantIds.push(tenantRes.rows[0].id);
        }

        // ------------------------------------------------------------------------
        // 7. Seed Initial Test Favorites for Demo Tenants
        // ------------------------------------------------------------------------

        // Gives immediate visible data when logging in as test tenant accounts.
        //
        // tenantIdx refers to the TENANTS array above.
        // propIdx refers to the seeded property order.
        //
        // Property IDs remain predictable (1-120).
        // Tenant IDs are intentionally separated into the 1001-1005 range.

        const demoFavorites = [
            [1, 0],
            [1, 1],
            [2, 2],
            [2, 15],
            [2, 30],
            [3, 3],
            [3, 18],
            [4, 4],
            [4, 5],
            [4, 16],
            [4, 32]
        ];

        for (const [tenantIdx, propIdx] of demoFavorites) {
            await client.query(
                `INSERT INTO favorites (user_id, property_id)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [
                    tenantIds[tenantIdx],
                    insertedPropertyIds[propIdx]
                ]
            );
        }

        await client.query('COMMIT');

        console.log('Database seeding successfully finished:');

        console.log('- 8 Cities');
        console.log('- 120 Properties');
        console.log('- 120 Property-owner Accounts (IDs 1-120)');
        console.log('- 5 Demo/Tenant Accounts (IDs 1001-1005)');
        console.log('- Tenant Password: test1234');
        console.log('- Pre-configured test favorites for tenants');
        console.log('- Contact history: empty (created by the contact endpoint)');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database seeding failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();