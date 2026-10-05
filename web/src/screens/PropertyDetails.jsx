import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getProperty, getPropertyContact, getCurrentUser, getImageUrl } from '../services/api.js';
import './PropertyDetails.css';

const formatString = (str) => {
    if (!str) return '';
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [contactDetails, setContactDetails] = useState(null);
    const [contactLoading, setContactLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            setPageLoading(true);
            try {
                const [propertyRes, userRes] = await Promise.allSettled([
                    getProperty(id),
                    getCurrentUser()
                ]);

                if (propertyRes.status === 'fulfilled') {
                    const propData = propertyRes.value.property || propertyRes.value;
                    setProperty(propData);
                } else {
                    throw new Error('Property not found');
                }

                if (userRes.status === 'fulfilled') {
                    setCurrentUser(userRes.value);
                }

            } catch (err) {
                setError('Failed to load property details.');
            } finally {
                setPageLoading(false);
            }
        }
        loadData();
    }, [id]);

    const handleContactOwner = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setContactLoading(true);
        try {
            const data = await getPropertyContact(id);
            setContactDetails(data.owner);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to get contact details');
        } finally {
            setContactLoading(false);
        }
    };

    if (pageLoading) return <main style={{ padding: '2rem', textAlign: 'center' }}>Loading property...</main>;
    if (error || !property) return <main style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</main>;

    const isOwner = currentUser?.id === property.owner_id;
    const hasPhotos = property.photos && property.photos.length > 0;

    return (
        <main className="property-details-page">

            {/* 1. TITLE AND LOCATION AT THE VERY TOP */}
            <div className="details-header top-header">
                <h1>{property.title}</h1>
                <p className="location">{property.locality}</p>
            </div>

            {/* 2. FULL WIDTH GALLERY (Main Image Left, Thumbnails Right) */}
            <div className="gallery-wrapper">
                <div className="main-image-box">
                    {hasPhotos ? (
                        <img src={getImageUrl(property.photos[activePhotoIndex])} alt="Property" />
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
                        <div className="overview-grid">
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
                        <h2>Amenities & Rules</h2>
                        <div className="pills-container">
                            {property.has_parking && <span className="pill">🚗 Parking Available</span>}
                            {property.has_lift && <span className="pill">🛗 Lift Available</span>}
                            {property.allow_family && <span className="pill">👨‍👩‍👧 Family Allowed</span>}
                            {property.allow_single_male && <span className="pill">👨 Single Male Allowed</span>}
                            {property.allow_single_female && <span className="pill">👩 Single Female Allowed</span>}

                            {!property.has_parking && !property.has_lift && !property.allow_family && !property.allow_single_male && !property.allow_single_female && (
                                <span className="label">No specific amenities or rules listed.</span>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="details-sidebar">
                    <div className="price-block">
                        <h3 className="rent">₹{Number(property.rent).toLocaleString('en-IN')} <span>/ month</span></h3>
                        <p className="deposit">Security Deposit: ₹{Number(property.deposit).toLocaleString('en-IN')}</p>
                    </div>

                    {isOwner ? (
                        <button
                            className="btn-sidebar btn-edit"
                            onClick={() => navigate(`/listings/${id}/edit`)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit Property
                        </button>
                    ) : contactDetails ? (
                        <div className="contact-info-card">
                            <h4>Owner Details</h4>
                            <p>{contactDetails.owner_name}</p>
                            <p>{contactDetails.owner_phone}</p>
                        </div>
                    ) : (
                        <button
                            className="btn-sidebar btn-contact"
                            onClick={handleContactOwner}
                            disabled={contactLoading}
                        >
                            {contactLoading ? 'Loading...' : 'Contact Owner'}
                        </button>
                    )}
                </aside>
            </div>
        </main>
    );
}

export default PropertyDetails;