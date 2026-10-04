import { Link } from 'react-router';
import { getImageUrl } from '../services/api.js';
import './PropertyCard.css';

function PropertyCard({ property, cityName }) {
    return (
        <article className="property-card">
            <Link
                to={`/properties/${property.id}`}
                className="property-card-link"
            >
                {property.photos?.length > 0 && (
                    <img
                        src={getImageUrl(property.photos[0])}
                        alt="Property"
                        className="property-card-image"
                    />
                )}
                <div className="property-card-content">
                    <h3>
                        {property.rooms}
                    </h3>
                    <p>
                        {cityName} · {property.locality}
                    </p>
                    <p>
                        ₹{property.rent} / month
                    </p>
                </div>
            </Link>
        </article>
    );
}

export default PropertyCard;