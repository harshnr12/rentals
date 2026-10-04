import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import ConfigContext from '../context/ConfigContext.js';
import { getProperties } from '../services/api.js';
import PropertyList from '../components/PropertyList.jsx';
import './Home.css';

function Home() {
    const { config, loading: configLoading, error: configError } = useContext(ConfigContext);
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');

    // Fetch initial property list on mount
    useEffect(() => {
        async function loadProperties() {
            setLoading(true);
            setError(null);
            try {
                const data = await getProperties();
                setProperties(data.properties || data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        loadProperties();
    }, []);

    // Navigate to search screen with city filter
    function handleCityChange(event) {
        const cityId = event.target.value;
        setSelectedCity(cityId);
        if (cityId) {
            navigate(`/properties?cityId=${cityId}`);
        }
    }

    if (configLoading) {
        return (
            <main className="home">
                <p>Loading...</p>
            </main>
        );
    }

    if (configError) {
        return (
            <main className="home">
                <p>Unable to load search options.</p>
            </main>
        );
    }

    const cities = config?.options?.cities || [];

    return (
        <main className="home">
            <section className="home-header">
                <div>
                    <h1>Welcome to Rentals!</h1>
                    <p>Find a place that fits your needs.</p>
                </div>

                <div className="city-picker">
                    <label htmlFor="city">Choose a city</label>
                    <select
                        id="city"
                        value={selectedCity}
                        onChange={handleCityChange}
                    >
                        <option value="">All Cities</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="home-properties">
                <h2>All Properties</h2>
                <PropertyList
                    properties={properties}
                    loading={loading}
                    error={error}
                    emptyMessage="No properties found."
                />
            </section>
        </main>
    );
}

export default Home;