import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext.js';
import UserDataContext from '../context/UserDataContext.js';
import { getCurrentUser, toggleFavorite as apiToggleFavorite } from '../services/api.js';

// Shared data for the authenticated user
function UserDataProvider({ children }) {
    const { isLoggedIn } = useContext(AuthContext);

    // User profile loaded from the backend
    const [currentUser, setCurrentUser] = useState(null);

    // Property IDs favorited by the current user
    const [favoriteIds, setFavoriteIds] = useState(() => new Set());

    // Property IDs whose owners the current user has contacted
    const [contactedIds, setContactedIds] = useState(() => new Set());

    // Loading & error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load or clear user data when login state changes
    useEffect(() => {
        if (!isLoggedIn) {
            setCurrentUser(null);
            setFavoriteIds(new Set());
            setContactedIds(new Set());
            setLoading(false);
            setError(null);
            return;
        }

        const loadUserData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getCurrentUser();
                const {
                    favorited_property_ids = [],
                    contacted_property_ids = [],
                    ...profile
                } = data.user;

                setCurrentUser(profile);
                setFavoriteIds(new Set(favorited_property_ids));
                setContactedIds(new Set(contacted_property_ids));
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [isLoggedIn]);

    // Centralized toggle: calls API and updates local Set
    const toggleFavorite = async (propertyId) => {
        const isFav = favoriteIds.has(propertyId);
        try {
            await apiToggleFavorite(propertyId);
            setFavoriteIds((prev) => {
                const updated = new Set(prev);
                if (isFav) {
                    updated.delete(propertyId);
                } else {
                    updated.add(propertyId);
                }
                return updated;
            });
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            throw err;
        }
    };

    const addContacted = (propertyId) => {
        setContactedIds((prev) => {
            const updated = new Set(prev);
            updated.add(propertyId);
            return updated;
        });
    };

    return (
        <UserDataContext.Provider
            value={{
                currentUser,
                favoriteIds,
                contactedIds,
                toggleFavorite,
                addContacted,
                loading,
                error
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
}

export default UserDataProvider;