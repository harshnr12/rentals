import { useContext } from 'react';
import ConfigContext from '../context/ConfigContext.js';
import PropertyCard from './PropertyCard.jsx';
import './PropertyList.css';

function PropertyList({
    properties = [],
    loading = false,
    error = null,
    emptyMessage = 'No properties found.'
}) {
    const { config } = useContext(ConfigContext);

    // Get city name from cached config options
    function getCityName(cityId) {
        if (!config?.options?.cities) return '';
        const city = config.options.cities.find(c => c.id === Number(cityId));
        return city ? city.name : '';
    }

    if (loading) {
        return <p className="property-list-message">Loading properties...</p>;
    }

    if (error) {
        return <p className="property-list-message">Error loading properties.</p>;
    }

    if (!properties || properties.length === 0) {
        return <p className="property-list-message">{emptyMessage}</p>;
    }

    return (
        <div className="property-list">
            {properties.map(property => (
                <PropertyCard
                    key={property.id}
                    property={property}
                    cityName={getCityName(property.city_id)}
                />
            ))}
        </div>
    );
}

export default PropertyList;