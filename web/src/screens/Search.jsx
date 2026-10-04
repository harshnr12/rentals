import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router';
import ConfigContext from '../context/ConfigContext.js';
import { getProperties } from '../services/api.js';
import PropertyList from '../components/PropertyList.jsx';
import './Search.css';

// Text format helper for labels
function formatText(str = '') {
    return str.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

// User-friendly sort labels
const sortLabels = {
    newest: 'Newest First',
    rent_asc: 'Rent (Low to High)',
    rent_desc: 'Rent (High to Low)'
};

function Search() {
    const { config, loading: configLoading } = useContext(ConfigContext);
    const [searchParams, setSearchParams] = useSearchParams();

    // Controlled form state initialized from URL
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

    // Single effect syncs inputs and fetches listings on URL change
    useEffect(() => {
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

        async function fetchFilteredProperties() {
            setLoading(true);
            setError(null);
            try {
                // Convert searchParams into plain object with array support
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

    // Handle generic text, number, and checkbox changes
    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    // Toggle multi-select furnishing checkboxes
    function handleFurnishingToggle(type) {
        setFilters((prev) => {
            const exists = prev.furnishing.includes(type);
            const updated = exists
                ? prev.furnishing.filter((item) => item !== type)
                : [...prev.furnishing, type];
            return { ...prev, furnishing: updated };
        });
    }

    // Push form values to URL query parameters
    function applyFilters(e) {
        e.preventDefault();

        const newParams = new URLSearchParams();

        if (filters.cityId) newParams.set('cityId', filters.cityId);
        if (filters.locality.trim()) newParams.set('locality', filters.locality.trim());
        if (filters.propertyType) newParams.set('propertyType', filters.propertyType);
        if (filters.bedrooms) newParams.set('bedrooms', filters.bedrooms);
        if (filters.bathrooms) newParams.set('bathrooms', filters.bathrooms);

        filters.furnishing.forEach((item) => newParams.append('furnishing', item));

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

    if (configLoading) return <div className="search-loading">Loading Search...</div>;

    const options = config?.options || {};
    const cities = options.cities || [];
    const propertyTypes = options.propertyTypes || [];
    const furnishingTypes = options.furnishingTypes || [];
    const sorts = options.sorts || [];

    return (
        <main className="search">
            <aside>
                <h3>Filters</h3>
                <form onSubmit={applyFilters}>
                    <label>City</label>
                    <select name="cityId" value={filters.cityId} onChange={handleChange}>
                        <option value="">All Cities</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
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
                        {propertyTypes.map((type) => (
                            <option key={type} value={type}>
                                {formatText(type)}
                            </option>
                        ))}
                    </select>

                    <label><strong>Min</strong> Bedrooms</label>
                    <select name="bedrooms" value={filters.bedrooms} onChange={handleChange}>
                        <option value="">Any</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>

                    <label><strong>Min</strong> Bathrooms</label>
                    <select name="bathrooms" value={filters.bathrooms} onChange={handleChange}>
                        <option value="">Any</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>

                    <label>Furnishing</label>
                    {furnishingTypes.map((type) => (
                        <div key={type} className="checkbox-group">
                            <input
                                type="checkbox"
                                id={`furnishing-${type}`}
                                checked={filters.furnishing.includes(type)}
                                onChange={() => handleFurnishingToggle(type)}
                            />
                            <label htmlFor={`furnishing-${type}`}>
                                {formatText(type)}
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
                        {sorts.map((sortOption) => (
                            <option key={sortOption} value={sortOption}>
                                {sortLabels[sortOption] || formatText(sortOption)}
                            </option>
                        ))}
                    </select>

                    <button type="submit">Apply Filters</button>
                </form>
            </aside>

            <section className="search-results">
                <h2>{properties.length} Properties Found</h2>
                <PropertyList
                    properties={properties}
                    loading={loading}
                    error={error}
                    emptyMessage="No properties match the search filters."
                />
            </section>
        </main>
    );
}

export default Search;