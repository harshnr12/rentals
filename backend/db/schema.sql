-- =========================================
-- USERS
-- =========================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================
-- USER PROFILES
-- =========================================

CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT
);


-- =========================================
-- CITIES
-- =========================================

CREATE TABLE cities (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);


-- =========================================
-- LOCATIONS
-- =========================================

CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    city_id BIGINT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,

    UNIQUE (city_id, name)
);


-- =========================================
-- PROPERTIES
-- =========================================

CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,

    owner_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    city_id BIGINT NOT NULL
        REFERENCES cities(id) ON DELETE RESTRICT,

    location_id BIGINT NOT NULL
        REFERENCES locations(id) ON DELETE RESTRICT,

    description TEXT NOT NULL,

    rent NUMERIC(12, 2) NOT NULL
        CHECK (rent >= 0),

    maintenance NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (maintenance >= 0),

    rooms SMALLINT NOT NULL
        CHECK (rooms >= 1),

    has_hall BOOLEAN NOT NULL DEFAULT false,

    has_kitchen BOOLEAN NOT NULL DEFAULT true,

    property_type TEXT NOT NULL
        CHECK (
            property_type IN (
                'flat',
                'house',
                'builder_floor',
                'villa',
                'duplex'
            )
        ),

    tenant_preference TEXT NOT NULL
        CHECK (
            tenant_preference IN (
                'family',
                'bachelors',
                'any'
            )
        ),

    furnishing TEXT NOT NULL
        CHECK (
            furnishing IN (
                'unfurnished',
                'semi_furnished',
                'fully_furnished'
            )
        ),

    floor SMALLINT NOT NULL
        CHECK (floor >= 0),

    total_floors SMALLINT NOT NULL
        CHECK (total_floors >= 1),

    lift BOOLEAN NOT NULL DEFAULT false,

    parking BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================
-- PROPERTY PHOTOS
-- =========================================

CREATE TABLE property_photos (
    id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL
        REFERENCES properties(id) ON DELETE CASCADE,

    image TEXT NOT NULL
);


-- =========================================
-- FAVORITES
-- =========================================

CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    property_id BIGINT NOT NULL
        REFERENCES properties(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, property_id)
);


-- =========================================
-- NOTIFICATIONS
-- =========================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);