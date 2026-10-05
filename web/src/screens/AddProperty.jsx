import { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import PropertyForm from '../components/PropertyForm.jsx';
import ConfigContext from '../context/ConfigContext.js';
import { createProperty, uploadPhotos } from '../services/api.js';

function AddProperty() {
    const navigate = useNavigate();
    const { config, loading: configLoading, error: configError } = useContext(ConfigContext);

    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleSubmit = async ({ formData, existingPhotos, newPhotos }) => {
        setSubmitLoading(true);
        setSubmitError(null);

        try {
            let uploadedPhotoUrls = [];

            // Step 1: Upload new photos to the media endpoint if any were selected
            if (newPhotos.length > 0) {
                const token = localStorage.getItem('token');
                uploadedPhotoUrls = await uploadPhotos(newPhotos, token);
            }

            // Step 2: Combine the form data and the resolved photo URLs into a clean JSON object
            const finalPayload = {
                ...formData,
                photos: [...existingPhotos, ...uploadedPhotoUrls]
            };

            // Step 3: Send standard JSON to the properties endpoint
            await createProperty(finalPayload);
            navigate('/my-listings');

        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to create property. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (configLoading) {
        return <main style={{ padding: '2rem', textAlign: 'center' }}>Loading form...</main>;
    }

    if (configError) {
        return <main style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Failed to load form configuration.</main>;
    }

    return (
        <PropertyForm
            title="Post a New Property"
            subtitle="Fill out the details below to list your property."
            initialData={{}} // Empty for new properties
            configData={config}
            onSubmit={handleSubmit}
            loading={submitLoading}
            error={submitError}
        />
    );
}

export default AddProperty;