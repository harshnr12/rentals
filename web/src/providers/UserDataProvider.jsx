import { useContext, useEffect, useState } from 'react';

import AuthContext from '../context/AuthContext.js';
import UserDataContext from '../context/UserDataContext.js';

import { getCurrentUser } from '../services/api.js';

// Shared data for the authenticated user
function UserDataProvider({ children }) {

    const { isLoggedIn } = useContext(AuthContext);

    // User profile loaded from the backend
    const [currentUser, setCurrentUser] = useState(null);

    // Property IDs favorited by the current user
    const [favoriteIds, setFavoriteIds] = useState(() => new Set());

    // Property IDs whose owners the current user has contacted
    const [contactedIds, setContactedIds] = useState(() => new Set());

    // Loading state for user-data request
    const [loading, setLoading] = useState(false);

    // Error from user-data request
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

            } catch (error) {
                setError(error);

            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, [isLoggedIn]);

    const addFavorite = (propertyId) => {
        setFavoriteIds((ids) => {
            // Create a new Set so React gets a new state reference
            const updatedIds = new Set(ids);
            updatedIds.add(propertyId);
            return updatedIds;
        });
    };

    const removeFavorite = (propertyId) => {
        setFavoriteIds((ids) => {
            // Create a new Set so React gets a new state reference
            const updatedIds = new Set(ids);
            updatedIds.delete(propertyId);
            return updatedIds;
        });

    };

    const addContacted = (propertyId) => {
        setContactedIds((ids) => {
            // Create a new Set so React gets a new state reference
            const updatedIds = new Set(ids);
            updatedIds.add(propertyId);
            return updatedIds;
        });
    };

    return (
        <UserDataContext.Provider
            value={{
                currentUser,
                favoriteIds,
                contactedIds,
                addFavorite,
                removeFavorite,
                addContacted,
                loading,
                error
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
};

export default UserDataProvider;