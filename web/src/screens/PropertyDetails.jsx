import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import AuthContext from '../context/AuthContext.js';
import UserDataContext from '../context/UserDataContext.js';
import {
    getProperty,
    getPropertyContact,
    getImageUrl,
    deleteProperty
} from '../services/api.js';
import './PropertyDetails.css';
import '../components/UserCollections.css';

function formatString(str) {
    if (!str) return '';
    return str
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatRemainingTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { isLoggedIn } = useContext(AuthContext);
    const {
        currentUser,
        favoriteIds,
        contactedIds,
        toggleFavorite,
        addContacted,
        loading: userDataLoading
    } = useContext(UserDataContext);

    const [property, setProperty] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);

    const [deleting, setDeleting] = useState(false);

    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [contactDetails, setContactDetails] = useState(null);
    const [contactLoading, setContactLoading] = useState(false);


    // Contact limit reached handling states
    const [contactLimitResetAt, setContactLimitResetAt] = useState(null);
    const [contactLimitSeconds, setContactLimitSeconds] = useState(0);
    const [contactLimitMessage, setContactLimitMessage] = useState('');

    // Count down to the exact reset time returned by the backend.
    useEffect(() => {
        if (!contactLimitResetAt) {
            return;
        }

        function updateRemainingTime() {
            const remainingSeconds = Math.max(
                0,
                Math.ceil(
                    (new Date(contactLimitResetAt).getTime() - Date.now()) / 1000
                )
            );
            setContactLimitSeconds(remainingSeconds);

            if (remainingSeconds === 0) {
                setContactLimitResetAt(null);
                setContactLimitMessage('');
            }
        }
        updateRemainingTime();
        const timer = setInterval(updateRemainingTime, 1000);

        return () => clearInterval(timer);
    }, [contactLimitResetAt]);

    // Load only public property data.
    // Current-user data is already available through the Context providers.
    useEffect(() => {
        async function loadProperty() {
            setPageLoading(true);
            setError(null);
            setProperty(null);
            setActivePhotoIndex(0);
            setContactDetails(null);
            try {
                const data = await getProperty(id);
                setProperty(data.property);
            } catch (err) {
                setError('Failed to load property details.');
            } finally {
                setPageLoading(false);
            }
        }
        loadProperty();
    }, [id]);

    // Contact details should not remain visible after logout.
    useEffect(() => {
        if (!isLoggedIn) {
            setContactDetails(null);
        }
    }, [isLoggedIn]);

    // First check login status.
    // Ownership only matters after the user is logged in and user data is loaded.
    let isOwner = false;

    if (isLoggedIn && !userDataLoading && currentUser) {
        isOwner = currentUser.id === property?.owner_id;
    }

    // Default action for a public visitor is to ask for log in.
    // Other states replace this text when necessary.
    let contactButtonText = 'Login to view contact';

    if (isLoggedIn) {
        contactButtonText = 'View Contact';

        if (userDataLoading) {
            contactButtonText = 'Loading...';
        } else if (contactLoading) {
            contactButtonText = 'Loading...';
        }
    }

    // Logged-out users go to login.
    // Logged-in non-owners request the protected contact endpoint.
    async function handleContactOwner() {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (userDataLoading || isOwner || contactLimitSeconds > 0) {
            return;
        }
        setContactLoading(true);
        try {
            const data = await getPropertyContact(id);
            setContactDetails(data.owner);

            // Keep the shared contacted state synchronized with the successful request.
            addContacted(property.id);
        }
        catch (err) {
            // The contact limiter returns the exact reset time when the daily limit is reached.
            if (err.response?.status === 429) {
                const data = err.response.data;
                setContactLimitMessage(data.message);
                setContactLimitResetAt(data.resetAt);
                return;
            }
            console.error('Failed to get contact details:', err);
        }
        finally {
            setContactLoading(false);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm('Are you sure you want to delete this property?');
        if (!confirmed) {
            return;
        }
        try {
            setDeleting(true);
            await deleteProperty(id);
            navigate('/my-listings');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete property');
        } finally {
            setDeleting(false);
        }
    }
    async function handleFavClick() {
        try {
            await toggleFavorite(property.id);
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    }

    if (pageLoading) {
        return (
            <main
                style={{
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                Loading property...
            </main>
        );
    }

    if (error || !property) {
        return (
            <main
                style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'red'
                }}>
                {error}
            </main>
        );
    }

    const hasPhotos = property.photos && property.photos.length > 0;
    const isFavorite = favoriteIds.has(property.id);
    const isContacted = contactedIds.has(property.id);

    return (
        <main className="property-details-page">
            {/* 1. TITLE AND LOCATION AT THE VERY TOP */}
            <div className="details-header top-header">
                <div className="title-block">
                    <h1>{property.title}</h1>
                    <p className="location">{property.locality}</p>
                </div>

                {/* Contact status and favorite action, only for logged-in users */}
                {isLoggedIn && (
                    <div className="title-actions">
                        {isContacted && (
                            <span className="collection-badge">✓ Contacted</span>
                        )}

                        {!isOwner && !userDataLoading && (
                            <button
                                type="button"
                                className={`details-fav-btn ${isFavorite ? 'active' : ''}`}
                                onClick={handleFavClick}
                                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <svg viewBox="0 0 24 24" className="details-heart-icon">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
            {/* 2. FULL WIDTH GALLERY (Main Image Left, Thumbnails Right) */}
            <div className="gallery-wrapper">
                <div className="main-image-box">
                    {hasPhotos ? (
                        <img
                            src={getImageUrl(property.photos[activePhotoIndex])}
                            alt="Property"
                        />
                    ) : (
                        <div className="no-image-fallback">No photos available</div>
                    )}
                </div>
                {hasPhotos && property.photos.length > 1 && (
                    <div className="thumbnail-strip">
                        {property.photos.map((photo, index) => (
                            <img
                                key={index}
                                src={getImageUrl(photo)}
                                alt={`Thumbnail ${index + 1}`}
                                className={`thumb-img ${index === activePhotoIndex ? 'active' : ''}`}
                                onClick={() => setActivePhotoIndex(index)}
                            />
                        ))}
                    </div>
                )}
            </div>
            {/* 3. TWO-COLUMN LAYOUT BELOW THE GALLERY */}
            <div className="content-layout">
                <div className="details-main">
                    <section className="section-card">
                        <h2>Overview</h2>
                        <div className="overview-items">
                            <div className="overview-item">
                                <span className="label">Type</span>
                                <span className="value">{formatString(property.property_type)}</span>
                            </div>
                            <div className="overview-item">
                                <span className="label">Bedrooms</span>
                                <span className="value">{property.bedrooms} BHK</span>
                            </div>
                            <div className="overview-item">
                                <span className="label">Bathrooms</span>
                                <span className="value">{property.bathrooms}</span>
                            </div>
                            <div className="overview-item">
                                <span className="label">Carpet Area</span>
                                <span className="value">{property.carpet_area_sqft} sqft</span>
                            </div>
                            <div className="overview-item">
                                <span className="label">Furnishing</span>
                                <span className="value">{formatString(property.furnishing)}</span>
                            </div>
                            <div className="overview-item">
                                <span className="label">🏢 Floor</span>
                                <span className="value">{property.floor_no} of {property.total_floors}</span>
                            </div>
                        </div>
                    </section>
                    <section className="section-card">
                        <h2>Tenant Preferences</h2>
                        <div className="pills-container">
                            <span className="pill">
                                👨‍👩‍👧 Family
                                {property.allow_family
                                    ? ' ✅ Allowed'
                                    : ' ❌ Not allowed'}
                            </span>
                            <span className="pill">
                                👨 Single Male
                                {property.allow_single_male
                                    ? ' ✅ Allowed'
                                    : ' ❌ Not allowed'}
                            </span>
                            <span className="pill">
                                👩 Single Female
                                {property.allow_single_female
                                    ? ' ✅ Allowed'
                                    : ' ❌ Not allowed'}
                            </span>
                        </div>
                    </section>
                    <section className="section-card">
                        <h2>Amenities</h2>
                        <div className="pills-container">
                            {property.has_parking && (
                                <span className="pill">🚗 Parking Available</span>
                            )}
                            {property.has_lift && (
                                <span className="pill">🛗 Lift Available</span>
                            )}
                            {!property.has_parking && !property.has_lift && (
                                <span className="label">No amenities listed for this property.</span>
                            )}
                        </div>
                    </section>
                </div>
                <aside className="details-sidebar">
                    <div className="price-block">
                        <h3 className="rent">
                            ₹{Number(property.rent).toLocaleString('en-IN')}
                            <span>/ month</span>
                        </h3>
                        <p className="deposit">
                            Security Deposit: ₹
                            {Number(property.deposit).toLocaleString('en-IN')}
                        </p>
                    </div>
                    {isOwner ? (
                        <>
                            <button
                                className="btn-sidebar btn-edit"
                                onClick={() => navigate(`/listings/${id}/edit`)}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit Property
                            </button>
                            <button
                                className="btn-sidebar btn-delete"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Property'}
                            </button>
                        </>
                    ) : contactDetails ? (
                        <div className="contact-info-card">
                            <h4>Owner Details</h4>
                            <p>{contactDetails.owner_name}</p>
                            <p>{contactDetails.owner_phone}</p>
                        </div>
                    ) : (
                        <>
                            {contactLimitMessage && contactLimitSeconds > 0 && (
                                <p className="contact-limit-error">
                                    {contactLimitMessage}
                                    <br />Try again in {formatRemainingTime(contactLimitSeconds)}.
                                </p>
                            )}
                            <button
                                className="btn-sidebar btn-contact"
                                onClick={handleContactOwner}
                                disabled={
                                    isLoggedIn &&
                                    (
                                        userDataLoading ||
                                        contactLoading ||
                                        contactLimitSeconds > 0
                                    )
                                }>
                                {contactButtonText}
                            </button>
                        </>
                    )}
                </aside>
            </div>
        </main>
    );
}

export default PropertyDetails;