import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router';
import ConfigContext from '../context/ConfigContext.js';
import { getProperties } from '../services/api.js';
import PropertyCard from '../components/PropertyCard.jsx';
import './Search.css';

function Search() {
    const { config, loading: configLoading } = useContext(ConfigContext);
    const [searchParams, setSearchParams] = useSearchParams();

    // Local form state synced with URL search parameters
    const [filters, setFilters] = useState({
        cityId: searchParams.get('cityId') || '',
        locality: searchParams.get('locality') || '',
        propertyType: searchParams.get('propertyType') || '',
        bedrooms: searchParams.get('bedrooms') || '',
        bathrooms: searchParams.get('bathrooms') || '',
        furnishing: searchParams.getAll('furnishing'),
        minRent: searchParams.get('minRent') || '',
        maxRent: searchParams.get('maxRent') || '',
        hasParking: searchParams.get('hasParking') === 'true',
        hasLift: searchParams.get('hasLift') === 'true',
        allowSingleMale: searchParams.get('allowSingleMale') === 'true',
        allowSingleFemale: searchParams.get('allowSingleFemale') === 'true',
        allowFamily: searchParams.get('allowFamily') === 'true',
        sort: searchParams.get('sort') || 'newest'
    });

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Single effect handles both form sync and API fetching on URL change
    useEffect(() => {
        // Sync input fields when URL parameters change
        setFilters({
            cityId: searchParams.get('cityId') || '',
            locality: searchParams.get('locality') || '',
            propertyType: searchParams.get('propertyType') || '',
            bedrooms: searchParams.get('bedrooms') || '',
            bathrooms: searchParams.get('bathrooms') || '',
            furnishing: searchParams.getAll('furnishing'),
            minRent: searchParams.get('minRent') || '',
            maxRent: searchParams.get('maxRent') || '',
            hasParking: searchParams.get('hasParking') === 'true',
            hasLift: searchParams.get('hasLift') === 'true',
            allowSingleMale: searchParams.get('allowSingleMale') === 'true',
            allowSingleFemale: searchParams.get('allowSingleFemale') === 'true',
            allowFamily: searchParams.get('allowFamily') === 'true',
            sort: searchParams.get('sort') || 'newest'
        });

        // Fetch listings from backend whenever URL search parameters change
        async function fetchFilteredProperties() {
            setLoading(true);
            setError(null);
            try {
                // Convert URLSearchParams into a plain object so Axios sends query params
                const params = {};
                for (const [key, value] of searchParams.entries()) {
                    if (params[key]) {
                        if (Array.isArray(params[key])) {
                            params[key].push(value);
                        } else {
                            params[key] = [params[key], value];
                        }
                    } else {
                        params[key] = value;
                    }
                }

                const data = await getProperties(params);
                setProperties(data.properties || data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchFilteredProperties();
    }, [searchParams]);

    // Handle generic text, number, and checkbox inputs
    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    // Toggle items in furnishing array
    function handleFurnishingToggle(type) {
        setFilters(prev => {
            const exists = prev.furnishing.includes(type);
            const updated = exists
                ? prev.furnishing.filter(item => item !== type)
                : [...prev.furnishing, type];
            return { ...prev, furnishing: updated };
        });
    }

    // Write form values back into URL parameters
    function applyFilters(e) {
        e.preventDefault();

        const newParams = new URLSearchParams();

        if (filters.cityId) newParams.set('cityId', filters.cityId);
        if (filters.locality.trim()) newParams.set('locality', filters.locality.trim());
        if (filters.propertyType) newParams.set('propertyType', filters.propertyType);
        if (filters.bedrooms) newParams.set('bedrooms', filters.bedrooms);
        if (filters.bathrooms) newParams.set('bathrooms', filters.bathrooms);

        filters.furnishing.forEach(item => newParams.append('furnishing', item));

        if (filters.minRent) newParams.set('minRent', filters.minRent);
        if (filters.maxRent) newParams.set('maxRent', filters.maxRent);

        if (filters.hasParking) newParams.set('hasParking', 'true');
        if (filters.hasLift) newParams.set('hasLift', 'true');
        if (filters.allowFamily) newParams.set('allowFamily', 'true');
        if (filters.allowSingleMale) newParams.set('allowSingleMale', 'true');
        if (filters.allowSingleFemale) newParams.set('allowSingleFemale', 'true');

        if (filters.sort) newParams.set('sort', filters.sort);

        setSearchParams(newParams);
    }

    // Find city label from cityId
    function getCityName(id) {
        if (!config) return '';
        const city = config.options.cities.find(c => c.id === Number(id));
        return city ? city.name : '';
    }

    if (configLoading) return <div>Loading Search...</div>;

    return (
        <main className="search">
            <aside>
                <h3>Filters</h3>
                <form onSubmit={applyFilters}>

                    <label>City</label>
                    <select name="cityId" value={filters.cityId} onChange={handleChange}>
                        <option value="">All Cities</option>
                        {config.options.cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>

                    <label>Locality</label>
                    <input
                        type="text"
                        name="locality"
                        placeholder="e.g. Rohini"
                        value={filters.locality}
                        onChange={handleChange}
                    />

                    <label>Property Type</label>
                    <select name="propertyType" value={filters.propertyType} onChange={handleChange}>
                        <option value="">Any</option>
                        {config.options.propertyTypes.map(type => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                    <label><strong>MIN</strong> Bedrooms</label>
                    <select name="bedrooms" value={filters.bedrooms} onChange={handleChange}>
                        <option value="">Any</option>
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4">4 BHK</option>
                        <option value="5">5 BHK</option>
                    </select>

                    <label><strong>MIN</strong> Bathrooms</label>
                    <select name="bathrooms" value={filters.bathrooms} onChange={handleChange}>
                        <option value="">Any</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>

                    <label>Furnishing</label>
                    {config.options.furnishingTypes.map(type => (
                        <div key={type} className="checkbox-group">
                            <input
                                type="checkbox"
                                id={`furnishing-${type}`}
                                checked={filters.furnishing.includes(type)}
                                onChange={() => handleFurnishingToggle(type)}
                            />
                            <label htmlFor={`furnishing-${type}`}>
                                {type.replace('_', ' ')}
                            </label>
                        </div>
                    ))}

                    <label>Min Rent (₹)</label>
                    <input
                        type="number"
                        name="minRent"
                        min="0"
                        placeholder="0"
                        value={filters.minRent}
                        onChange={handleChange}
                    />

                    <label>Max Rent (₹)</label>
                    <input
                        type="number"
                        name="maxRent"
                        min="0"
                        placeholder="No limit"
                        value={filters.maxRent}
                        onChange={handleChange}
                    />

                    <label>Amenities</label>
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="hasParking"
                            name="hasParking"
                            checked={filters.hasParking}
                            onChange={handleChange}
                        />
                        <label htmlFor="hasParking">Parking</label>
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="hasLift"
                            name="hasLift"
                            checked={filters.hasLift}
                            onChange={handleChange}
                        />
                        <label htmlFor="hasLift">Lift</label>
                    </div>

                    <label>Tenants Allowed</label>
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="allowFamily"
                            name="allowFamily"
                            checked={filters.allowFamily}
                            onChange={handleChange}
                        />
                        <label htmlFor="allowFamily">Family</label>
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="allowSingleMale"
                            name="allowSingleMale"
                            checked={filters.allowSingleMale}
                            onChange={handleChange}
                        />
                        <label htmlFor="allowSingleMale">Single Male</label>
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="allowSingleFemale"
                            name="allowSingleFemale"
                            checked={filters.allowSingleFemale}
                            onChange={handleChange}
                        />
                        <label htmlFor="allowSingleFemale">Single Female</label>
                    </div>

                    <label>Sort By</label>
                    <select name="sort" value={filters.sort} onChange={handleChange}>
                        <option value="newest">Newest First</option>
                        <option value="rent_asc">Rent (Low to High)</option>
                        <option value="rent_desc">Rent (High to Low)</option>
                    </select>

                    <button type="submit">Apply Filters</button>
                </form>
            </aside>

            <section>
                <h2>{properties.length} Properties Found</h2>

                {loading ? (
                    <p>Loading properties...</p>
                ) : error ? (
                    <p>Error loading properties.</p>
                ) : properties.length === 0 ? (
                    <p>No properties match the search filters.</p>
                ) : (
                    <div className="properties-list">
                        {properties.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                cityName={getCityName(property.city_id)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Search;