import { useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import AuthContext from '../context/AuthContext.js';
import UserDataContext from '../context/UserDataContext.js';
import { getImageUrl } from '../services/api.js';
import './PropertyCard.css';

function PropertyCard({ property, cityName }) {
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(AuthContext);
    const { currentUser, favoriteIds, contactedIds, toggleFavorite } = useContext(UserDataContext);

    // Ownership check to distinguish owner actions from visitor actions
    const isOwner = currentUser && currentUser.id === property.owner_id;

    // O(1) Set lookups
    const isFavorite = favoriteIds ? favoriteIds.has(property.id) : false;
    const isContacted = contactedIds ? contactedIds.has(property.id) : false;
    const photoUrl = property.photos?.length > 0 ? getImageUrl(property.photos[0]) : null;

    // Navigate to listing edit view without triggering parent card link
    function handleEditClick(e) {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/listings/${property.id}/edit`);
    }

    // Toggle favorite state without triggering link navigation
    async function handleFavClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (toggleFavorite) {
            try {
                await toggleFavorite(property.id);
            } catch (err) {
                // Network failure or unauthenticated session
                console.error('Failed to toggle favorite:', err);
            }
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

                {/* Only display contact status to logged-in users */}
                {isLoggedIn && isContacted && (
                    <span className="contacted-badge">✓ Contacted</span>
                )}

                {/* Only render favorite action for logged-in users */}
                {isLoggedIn && (
                    isOwner ? (
                        <button
                            type="button"
                            className="fav-btn"
                            onClick={handleEditClick}
                        >
                            <svg viewBox="0 0 24 24" className="heart-icon">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`fav-btn ${isFavorite ? 'active' : ''}`}
                            onClick={handleFavClick}
                        >
                            <svg viewBox="0 0 24 24" className="heart-icon">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
                    )
                )}
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