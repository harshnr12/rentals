import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getMyListedProperties } from '../services/api.js';
import PropertyList from '../components/PropertyList.jsx';
import '../components/UserCollections.css';

function MyListings() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchListings() {
            setLoading(true);
            setError(null);
            try {
                const data = await getMyListedProperties();
                setProperties(data.properties || []);
            } catch (err) {
                setError('Failed to load listings. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchListings();
    }, []);

    return (
        <main className="collection-page">
            <header className="collection-header">
                <div className="collection-title-group">
                    <h1>My Listings</h1>
                    {!loading && !error && (
                        <span className="collection-badge">
                            {properties.length} {properties.length === 1 ? 'listing' : 'listings'}
                        </span>
                    )}
                </div>

                <Link to="/listings/new" className="collection-action-btn">
                    + Post Property
                </Link>
            </header>

            <PropertyList
                properties={properties}
                loading={loading}
                error={error}
                emptyMessage="No listings posted yet. Use the button above to publish a rental listing."
            />
        </main>
    );
}

export default MyListings;