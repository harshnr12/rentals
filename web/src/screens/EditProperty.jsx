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
                setInitialData({
                    cityId: propertyRes.city_id,
                    locality: propertyRes.locality,
                    propertyType: propertyRes.property_type,
                    furnishing: propertyRes.furnishing,
                    rent: propertyRes.rent,
                    deposit: propertyRes.deposit,
                    carpetAreaSqft: propertyRes.carpet_area_sqft,
                    bedrooms: propertyRes.bedrooms,
                    bathrooms: propertyRes.bathrooms,
                    floorNo: propertyRes.floor_no,
                    totalFloors: propertyRes.total_floors,
                    hasParking: propertyRes.has_parking,
                    hasLift: propertyRes.has_lift,
                    allowSingleMale: propertyRes.allow_single_male,
                    allowSingleFemale: propertyRes.allow_single_female,
                    allowFamily: propertyRes.allow_family,
                    photos: propertyRes.photos || []
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
        return <main style={{ padding: '2rem', textAlign: 'center' }}>Loading property details...</main>;
    }

    if (configError || propertyError) {
        return <main style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            {configError ? 'Failed to load form configuration.' : propertyError}
        </main>;
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