// backend/controllers/favoriteController.js
import pool from '../db/pool.js';

// POST /api/favorites/:propertyId
// Toggles saved status on and off in a single endpoint
export const toggleFavorite = async (req, res) => {
    const userId = req.user.id; // Populated by auth middleware
    const { propertyId } = req.params;

    try {
        // 1. Check if the property is already favorited
        const existing = await pool.query(
            'SELECT 1 FROM favorites WHERE user_id = $1 AND property_id = $2',
            [userId, propertyId]
        );

        if (existing.rows.length > 0) {
            // 2a. If found -> Unfavorite (remove)
            await pool.query(
                'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2',
                [userId, propertyId]
            );
            return res.status(200).json({ favorited: false, message: 'Removed from favorites' });
        }

        // 2b. If not found -> Favorite (insert)
        await pool.query(
            'INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)',
            [userId, propertyId]
        );
        return res.status(201).json({ favorited: true, message: 'Added to favorites' });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        return res.status(500).json({ error: 'Failed to update favorite status' });
    }
};

// GET /api/favorites
// Returns all properties saved by the logged-in user
export const getMyFavorites = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
      SELECT 
        p.id,
        p.title,
        p.locality,
        p.rent,
        p.deposit,
        p.carpet_area_sqft,
        p.bedrooms,
        p.bathrooms,
        p.furnishing,
        p.property_type,
        p.photos,
        c.name AS city_name
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      JOIN cities c ON p.city_id = c.id
      WHERE f.user_id = $1
      ORDER BY p.id DESC
    `;

        const { rows } = await pool.query(query, [userId]);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return res.status(500).json({ error: 'Failed to fetch favorite properties' });
    }
};