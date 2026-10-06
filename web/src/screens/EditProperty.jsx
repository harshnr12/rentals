import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import PropertyForm from '../components/PropertyForm.jsx';
import ConfigContext from '../context/ConfigContext.js';
import { getProperty, updateProperty, uploadPhotos } from '../services/api.js';

function EditProperty() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { config, loading: configLoading, error: configError } = useContext(ConfigContext);
    const [initialData, setInitialData] = useState(null);
    const [propertyLoading, setPropertyLoading] = useState(true);
    const [propertyError, setPropertyError] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Fetch the specific property and map snake_case to camelCase
    useEffect(() => {
        async function loadProperty() {
            try {
                const propertyRes = await getProperty(id);

                // The API returns the property inside the "property" field.
                const property = propertyRes.property;

                setInitialData({
                    cityId: property.city_id,
                    locality: property.locality,
                    propertyType: property.property_type,
                    furnishing: property.furnishing,
                    rent: property.rent,
                    deposit: property.deposit,
                    carpetAreaSqft: property.carpet_area_sqft,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    floorNo: property.floor_no,
                    totalFloors: property.total_floors,
                    hasParking: property.has_parking,
                    hasLift: property.has_lift,
                    allowSingleMale: property.allow_single_male,
                    allowSingleFemale: property.allow_single_female,
                    allowFamily: property.allow_family,

                    // Keep the existing photo URLs so the form can display
                    // them and let the owner remove selected photos.
                    photos: property.photos || []
                });
            } catch (err) {
                setPropertyError('Failed to load property data. It may have been deleted or you do not have permission.');
            } finally {
                setPropertyLoading(false);
            }
        }
        loadProperty();
    }, [id]);
    const handleSubmit = async ({ formData, existingPhotos, newPhotos }) => {
        setSubmitLoading(true);
        setSubmitError(null);
        try {
            let uploadedPhotoUrls = [];

            // Step 1: Upload new photos if any were added
            if (newPhotos.length > 0) {
                const token = localStorage.getItem('token');
                uploadedPhotoUrls = await uploadPhotos(newPhotos, token);
            }

            // Step 2: Combine the photos the user KEPT with the NEW ones just uploaded
            const finalPayload = {
                ...formData,
                photos: [...existingPhotos, ...uploadedPhotoUrls]
            };

            // Step 3: Send standard JSON PATCH to the properties endpoint
            await updateProperty(id, finalPayload);
            navigate(`/properties/${id}`);

        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to update property. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (configLoading || propertyLoading) {
        return (
            <main
                style={{ padding: '2rem', textAlign: 'center' }}>
                Loading property details...
            </main>
        );
    }

    if (configError || propertyError) {
        return (
            <main
                style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'red'
                }}>
                {configError ? 'Failed to load form configuration.' : propertyError}
            </main>
        );
    }

    return (
        <PropertyForm
            title="Edit Property"
            subtitle="Update the details of your listing."
            initialData={initialData}
            configData={config}
            onSubmit={handleSubmit}
            loading={submitLoading}
            error={submitError}
        />
    );
}

export default EditProperty;