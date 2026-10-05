import { useState, useEffect } from 'react';
import { getMyFavorites } from '../services/api.js';
import PropertyList from '../components/PropertyList.jsx';
import '../components/UserCollections.css';

function Favorites() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFavorites() {
            setLoading(true);
            setError(null);
            try {
                const data = await getMyFavorites();
                setProperties(data.properties || []);
            } catch (err) {
                setError('Failed to load favorite properties. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchFavorites();
    }, []);

    return (
        <main className="collection-page">
            <div className="collection-header">
                <div className="collection-title-group">
                    <h1>Favorite Properties</h1>
                    {!loading && !error && (
                        <span className="collection-badge">
                            {properties.length} {properties.length === 1 ? 'favorite' : 'favorites'}
                        </span>
                    )}
                </div>
            </div>

            <PropertyList
                properties={properties}
                loading={loading}
                error={error}
                emptyMessage="No favorite properties yet. Click the heart icon on any listing to save it here."
            />
        </main>
    );
}

export default Favorites;