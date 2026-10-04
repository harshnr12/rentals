import { useContext } from 'react';
import { Link } from 'react-router';
import { getImageUrl } from '../services/api.js';
import UserDataContext from '../context/UserDataContext.js';
import './PropertyCard.css';

function PropertyCard({ property, cityName }) {
    // Read from context
    const { favorites = [], contacted = [], toggleFavorite } = useContext(UserDataContext);

    const isFav = favorites.includes(property.id);
    const hasContacted = contacted.includes(property.id);
    const photoUrl = property.photos?.length > 0 ? getImageUrl(property.photos[0]) : null;

    // Handle favorite click without navigating to the details page
    async function handleFavClick(e) {
        e.preventDefault();
        if (toggleFavorite) {
            await toggleFavorite(property.id);
        }
    }

    return (
        <Link to={`/properties/${property.id}`} className="card">

            <div className="img-box">
                {photoUrl ? (
                    <img src={photoUrl} alt={property.title} />
                ) : (
                    <div className="img-fallback">No Image</div>
                )}

                {/* Contacted Banner */}
                {hasContacted && <span className="contacted-badge">✓ Contacted</span>}

                {/* Favorite Emoji Button */}
                <button className="fav-btn" onClick={handleFavClick}>
                    {isFav ? '❤️' : '🤍'}
                </button>
            </div>

            <div className="info">
                <h3>{property.title}</h3>
                <p className="loc">{cityName} • {property.locality}</p>

                <div className="tags">
                    {property.furnishing && <span>{property.furnishing}</span>}
                    {property.type && <span>{property.type}</span>}
                </div>

                <div className="price">
                    ₹{property.rent} <span>/ mo</span>
                </div>
            </div>
        </Link>
    );
}

export default PropertyCard;