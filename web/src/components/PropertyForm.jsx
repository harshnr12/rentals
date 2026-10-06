import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getImageUrl } from '../services/api.js';
import './PropertyForm.css';

function formatString(str) {
    if (!str) return '';
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function PropertyForm({ title, subtitle, initialData, configData, onSubmit, loading, error }) {
    const navigate = useNavigate();

    // 1. Text and Boolean State
    const [formData, setFormData] = useState({
        cityId: initialData?.cityId ?? '',
        locality: initialData?.locality ?? '',
        propertyType: initialData?.propertyType ?? 'apartment',
        furnishing: initialData?.furnishing ?? 'unfurnished',
        rent: initialData?.rent ?? '',
        deposit: initialData?.deposit ?? '',
        carpetAreaSqft: initialData?.carpetAreaSqft ?? '',
        bedrooms: initialData?.bedrooms ?? '',
        bathrooms: initialData?.bathrooms ?? '',
        floorNo: initialData?.floorNo ?? '',
        totalFloors: initialData?.totalFloors ?? '',
        hasParking: initialData?.hasParking ?? false,
        hasLift: initialData?.hasLift ?? false,
        allowSingleMale: initialData?.allowSingleMale ?? false,
        allowSingleFemale: initialData?.allowSingleFemale ?? false,
        allowFamily: initialData?.allowFamily ?? false,
    });

    // 2. Media State
    const [existingPhotos, setExistingPhotos] = useState(initialData?.photos ?? []);
    const [newPhotos, setNewPhotos] = useState([]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    function handleFileChange(e) {
        // Capture raw File objects for the wrapper screen to upload
        setNewPhotos(Array.from(e.target.files));
    }

    function handleRemoveExistingPhoto(urlToRemove) {
        setExistingPhotos(prev => prev.filter(url => url !== urlToRemove));
    }

    function handleSubmit(e) {
        e.preventDefault();

        // Hand everything over to the smart wrapper screen
        onSubmit({ formData, existingPhotos, newPhotos });
    }

    if (!configData) {
        return (
            <div className="property-form-wrapper">
                <p>Loading form configuration...</p>
            </div>
        );
    }
    const { options, fieldValidation } = configData;

    return (
        <main className="property-form-wrapper">
            <div className="property-form-card">
                <header className="property-form-header">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </header>
                {error && <div className="form-error">{error}</div>}
                <form className="property-form" onSubmit={handleSubmit}>
                    {/* SECTION 1: Location */}
                    <section className="form-section">
                        <h3>Location & Details</h3>
                        <div className="form-row-2">
                            <div className="input-group">
                                <label>City</label>
                                <select
                                    name="cityId"
                                    value={formData.cityId}
                                    onChange={handleChange}
                                    required={fieldValidation.cityId.required}>
                                    <option value="" disabled>Select a city</option>
                                    {options.cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Locality</label>
                                <input
                                    type="text"
                                    name="locality"
                                    placeholder="e.g. Indiranagar"
                                    value={formData.locality}
                                    onChange={handleChange}
                                    required={fieldValidation.locality.required}
                                />
                            </div>
                        </div>
                        <div className="form-row-2">
                            <div className="input-group">
                                <label>Property Type</label>
                                <select
                                    name="propertyType"
                                    value={formData.propertyType}
                                    onChange={handleChange}>
                                    {options.propertyTypes.map(type => (
                                        <option key={type} value={type}>{formatString(type)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Furnishing</label>
                                <select
                                    name="furnishing"
                                    value={formData.furnishing}
                                    onChange={handleChange}>
                                    {options.furnishingTypes.map(type => (
                                        <option key={type} value={type}>{formatString(type)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>
                    {/* SECTION 2: Pricing & Dimensions */}
                    <section className="form-section">
                        <h3>Pricing & Size</h3>
                        <div className="form-row-3">
                            <div className="input-group">
                                <label>Monthly Rent (₹)</label>
                                <input
                                    type="number"
                                    name="rent"
                                    value={formData.rent}
                                    onChange={handleChange}
                                    min={fieldValidation.rent.min}
                                    required={fieldValidation.rent.required}
                                />
                            </div>
                            <div className="input-group">
                                <label>Security Deposit (₹)</label>
                                <input
                                    type="number"
                                    name="deposit"
                                    value={formData.deposit}
                                    onChange={handleChange}
                                    min={fieldValidation.deposit.min}
                                    required={fieldValidation.deposit.required}
                                />
                            </div>
                            <div className="input-group">
                                <label>Carpet Area (sqft)</label>
                                <input
                                    type="number"
                                    name="carpetAreaSqft"
                                    value={formData.carpetAreaSqft}
                                    onChange={handleChange}
                                    min={fieldValidation.carpetAreaSqft.min}
                                    required={fieldValidation.carpetAreaSqft.required}
                                />
                            </div>
                        </div>
                    </section>
                    {/* SECTION 3: Configuration */}
                    <section className="form-section">
                        <h3>Configuration</h3>
                        <div className="form-row-2">
                            <div className="input-group">
                                <label>Bedrooms</label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    min={fieldValidation.bedrooms.min}
                                    required={fieldValidation.bedrooms.required}
                                />
                            </div>
                            <div className="input-group">
                                <label>Bathrooms</label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    min={fieldValidation.bathrooms.min}
                                    required={fieldValidation.bathrooms.required}
                                />
                            </div>
                            <div className="input-group">
                                <label>Floor Number</label>
                                <input
                                    type="number"
                                    name="floorNo"
                                    value={formData.floorNo}
                                    onChange={handleChange}
                                    min={fieldValidation.floorNo.min}
                                    required={fieldValidation.floorNo.required}
                                />
                            </div>
                            <div className="input-group">
                                <label>Total Floors in Building</label>
                                <input
                                    type="number"
                                    name="totalFloors"
                                    value={formData.totalFloors}
                                    onChange={handleChange}
                                    min={fieldValidation.totalFloors.min}
                                    required={fieldValidation.totalFloors.required}
                                />
                            </div>
                        </div>
                    </section>
                    {/* SECTION 4: Preferences & Amenities */}
                    <section className="form-section">
                        <h3>Rules & Amenities</h3>
                        <label className="input-group">Tenant Preferences</label>
                        <div className="checkbox-group-wrapper">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="allowFamily"
                                    checked={formData.allowFamily}
                                    onChange={handleChange}
                                />
                                Family
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="allowSingleMale"
                                    checked={formData.allowSingleMale}
                                    onChange={handleChange}
                                />
                                Single Male
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="allowSingleFemale"
                                    checked={formData.allowSingleFemale}
                                    onChange={handleChange}
                                />
                                Single Female
                            </label>
                        </div>
                        <label
                            className="input-group"
                            style={{ marginTop: '0.5rem' }}>
                            Amenities
                        </label>
                        <div className="checkbox-group-wrapper">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="hasParking"
                                    checked={formData.hasParking}
                                    onChange={handleChange}
                                />
                                Parking Available
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="hasLift"
                                    checked={formData.hasLift}
                                    onChange={handleChange}
                                />
                                Lift Available
                            </label>
                        </div>
                    </section>
                    {/* SECTION 5: Uploads */}
                    <section className="form-section">
                        <h3>Photos</h3>
                        {existingPhotos.length > 0 && (
                            <div className="photo-preview-section">
                                <label
                                    className="input-group"
                                    style={{ marginBottom: '0.5rem' }}>
                                    Current Photos
                                </label>
                                <div className="photo-preview-grid">
                                    {existingPhotos.map(url => (
                                        <div
                                            key={url}
                                            className="photo-preview-item">
                                            <img
                                                src={getImageUrl(url)}
                                                alt="Property"
                                            />
                                            <button
                                                type="button"
                                                className="photo-preview-remove"
                                                onClick={() => handleRemoveExistingPhoto(url)}
                                                title="Remove this photo">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="input-group">
                            <label>Add New Photos</label>
                            <input
                                type="file"
                                name="photos"
                                multiple
                                accept={fieldValidation.photos.allowedTypes.join(', ')}
                                onChange={handleFileChange}
                            />
                            <small style={{ color: 'var(--muted)' }}>Max {fieldValidation.photos.maxCount} total photos, up to {fieldValidation.photos.maxSizeMb}MB each.</small>
                        </div>
                    </section>
                    {/* ACTIONS */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate(-1)}
                            disabled={loading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}>
                            {loading ? 'Saving...' : 'Save Property'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default PropertyForm;