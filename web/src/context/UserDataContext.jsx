import { createContext, useContext, useEffect, useState } from 'react';

import { AuthContext } from './AuthContext.jsx';

import { getCurrentUser } from '../services/api.js';

// Authenticated user's shared application data
export const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);

    const [currentUser, setCurrentUser] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [contactedIds, setContactedIds] = useState(new Set());

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            const updatedIds = new Set(ids);

            updatedIds.add(propertyId);

            return updatedIds;
        });
    };

    const removeFavorite = (propertyId) => {
        setFavoriteIds((ids) => {
            const updatedIds = new Set(ids);

            updatedIds.delete(propertyId);

            return updatedIds;
        });
    };

    const addContacted = (propertyId) => {
        setContactedIds((ids) => {
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