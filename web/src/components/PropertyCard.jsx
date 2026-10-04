import { useContext } from 'react';
import { Link } from 'react-router';
import { getImageUrl } from '../services/api.js';
import UserDataContext from '../context/UserDataContext.js';
import './PropertyCard.css';

function PropertyCard({ property, cityName }) {
    const { favorites = [], contacted = [], toggleFavorite } = useContext(UserDataContext);

    const isFav = favorites.includes(property.id);
    const hasContacted = contacted.includes(property.id);
    const photoUrl = property.photos?.length > 0 ? getImageUrl(property.photos[0]) : null;

    // Toggle favorite state without opening the property link
    async function handleFavClick(e) {
        e.preventDefault();
        e.stopPropagation();
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

                {/* Contacted status chip */}
                {hasContacted && <span className="contacted-badge">✓ Contacted</span>}

                {/* Floating Heart Button */}
                <button
                    type="button"
                    className={`fav-btn ${isFav ? 'active' : ''}`}
                    onClick={handleFavClick}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="heart-icon"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>

            <div className="info">
                <h3>{property.title}</h3>
                <p className="loc">{cityName} • {property.locality}</p>

                <div className="tags">
                    {property.furnishing && (
                        <span>{property.furnishing.replace('_', ' ')}</span>
                    )}
                    {property.type && (
                        <span>{property.type.replace('_', ' ')}</span>
                    )}
                </div>

                <div className="price">
                    ₹{property.rent} <span>/ mo</span>
                </div>
            </div>
        </Link>
    );
}

export default PropertyCard;