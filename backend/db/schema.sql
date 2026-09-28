DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE cities (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE properties (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id INT NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    locality VARCHAR(100) NOT NULL,
    rent INT NOT NULL CHECK (rent > 0),
    deposit INT NOT NULL CHECK (deposit >= 0),
    carpet_area_sqft SMALLINT NOT NULL CHECK (carpet_area_sqft > 0),
    bedrooms SMALLINT NOT NULL CHECK (bedrooms >= 1),
    bathrooms SMALLINT NOT NULL CHECK (bathrooms >= 1),
    floor_no SMALLINT NOT NULL CHECK (floor_no >= 0),
    total_floors SMALLINT NOT NULL CHECK (total_floors >= 0),
    furnishing VARCHAR(20) NOT NULL CHECK (furnishing IN ('unfurnished', 'semi_furnished', 'fully_furnished')),
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'villa')),
    has_parking BOOLEAN NOT NULL DEFAULT false,
    has_lift BOOLEAN NOT NULL DEFAULT false,
    allow_single_male BOOLEAN NOT NULL DEFAULT false,
    allow_single_female BOOLEAN NOT NULL DEFAULT false,
    allow_family BOOLEAN NOT NULL DEFAULT false,
    photos TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tenant_preference CHECK (allow_single_male OR allow_single_female OR allow_family),
    CONSTRAINT chk_floor_logic CHECK (floor_no <= total_floors)
);

CREATE TABLE favorites (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, property_id)
);

-- =========================================================
-- CONTACT HISTORY
-- =========================================================
-- Stores a user's historical contact/unlock interactions
-- with properties.
--
-- One row represents one unique user-property contact.
-- The composite primary key prevents the same user from
-- being recorded twice for the same property.
--
-- IMPORTANT:
-- property_id intentionally does NOT have a foreign key
-- constraint to properties(id).
--
-- Contact history is treated as immutable historical data:
-- if a property is later deleted, the user's past contact
-- with that property must remain recorded.
--
-- Therefore, adding:
--
--     REFERENCES properties(id) ON DELETE CASCADE
--
-- would be incorrect for this requirement because deleting
-- the property would also delete the historical contact row.
--
-- The property row may disappear, but the contact record
-- remains available for usage tracking, history, and future
-- contact-limit/premium logic.
-- =========================================================
CREATE TABLE contacted_properties (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL,
    contacted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id)
);

-- Fast lookup Indexes
CREATE INDEX idx_properties_city_locality ON properties(city_id, locality);
CREATE INDEX idx_properties_rent ON properties(rent);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);
CREATE INDEX idx_contacted_properties_property_id ON contacted_properties(property_id);
-- last one Used when looking up all users who contacted a property.