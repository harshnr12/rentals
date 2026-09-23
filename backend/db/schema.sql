-- Clean up existing tables if resetting schema locally
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS property_photos CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS (Authentication Credentials)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER PROFILES (User Details & Contact Info)
CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT
);

-- 3. CITIES (Master Geographies)
CREATE TABLE cities (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 4. LOCATIONS / LOCALITIES (Linked to Cities)
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    city_id BIGINT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE (city_id, name)
);

-- 5. PROPERTIES (Core Listing Data)
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id BIGINT NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    rent INTEGER NOT NULL CHECK (rent > 0),
    maintenance INTEGER NOT NULL DEFAULT 0 CHECK (maintenance >= 0),
    rooms SMALLINT NOT NULL CHECK (rooms >= 1),
    bathrooms SMALLINT NOT NULL DEFAULT 1 CHECK (bathrooms >= 1),
    has_hall BOOLEAN NOT NULL DEFAULT false,
    has_kitchen BOOLEAN NOT NULL DEFAULT false,
    property_type TEXT NOT NULL CHECK (
        property_type IN ('flat', 'house', 'builder_floor', 'villa', 'duplex')
    ),
    tenant_preference TEXT NOT NULL CHECK (
        tenant_preference IN ('family', 'bachelors', 'any')
    ),
    furnishing TEXT NOT NULL CHECK (
        furnishing IN ('unfurnished', 'semi_furnished', 'fully_furnished')
    ),
    floor SMALLINT NOT NULL CHECK (floor >= 0),
    total_floors SMALLINT NOT NULL CHECK (total_floors >= 1),
    lift BOOLEAN NOT NULL DEFAULT false,
    parking BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_floor_validity CHECK (floor <= total_floors)
);

-- 6. PROPERTY PHOTOS (Multiple Images per Property)
CREATE TABLE property_photos (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image TEXT NOT NULL
);

-- 7. FAVORITES (User Saved Listings)
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, property_id)
);

-- 8. NOTIFICATIONS (User In-App Alerts)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Foreign Key lookups for joins and deletion cascades
CREATE INDEX idx_locations_city_id ON locations(city_id);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_city_id ON properties(city_id);
CREATE INDEX idx_properties_location_id ON properties(location_id);
CREATE INDEX idx_property_photos_property_id ON property_photos(property_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Filter & Sorting indexes for 99acres-style discovery
CREATE INDEX idx_properties_rent ON properties(rent);
CREATE INDEX idx_properties_city_rent ON properties(city_id, rent);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
