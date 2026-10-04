import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import ConfigContext from '../context/ConfigContext.js';
import { getProperties } from '../services/api.js';
import PropertyCard from '../components/PropertyCard.jsx';
import './Home.css';

function Home() {
    const { config, loading: configLoading, error: configError } = useContext(ConfigContext);
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');

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

    function handleCityChange(event) {
        const cityId = event.target.value;
        setSelectedCity(cityId);

        if (cityId) {
            navigate(`/properties?cityId=${cityId}`);
        }
    }

    if (configLoading || loading) {
        return (
            <main className="home">
                <p>Loading...</p>
            </main>
        );
    }

    if (configError || error) {
        return (
            <main className="home">
                <p>Unable to load properties.</p>
            </main>
        );
    }

    const cities = config.options.cities;

    function getCityName(cityId) {
        const city = cities.find((city) => city.id === cityId);
        return city ? city.name : '';
    }

    return (
        <main className="home">
            <section className="home-header">
                <div>
                    <h1>Welcome to Rentals!</h1>
                    <p>Find a place that fits your needs.</p>
                </div>
                {/* City dropdown placed on the right */}
                <div className="city-picker">
                    <label htmlFor="city">Choose a city</label>
                    <select
                        id="city"
                        value={selectedCity}
                        onChange={handleCityChange}>
                        <option value="">All Cities</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>
                </div>
            </section>
            <section className="home-properties">
                <h2>All Properties</h2>
                <div className="property-list">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            cityName={getCityName(property.city_id)}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}

export default Home;