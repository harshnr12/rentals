import axios from 'axios';

const API_HOST = import.meta.env.VITE_API_BASE_URL;

const api = axios.create(
    { baseURL: `${API_HOST}/api/v1` }
);

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
);


// Metadata
export const getConfig = async () => {
    const response = await api.get('/config');
    return response.data;
};


// Auth
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
};


// Media
export const uploadPhotos = async (files, token) => {
    const formData = new FormData();
    for (const file of files) {
        formData.append('photos', file);
    }
    const response = await api.post('/upload', formData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.photoUrls;
};

export const getImageUrl = (photoUrl) => {
    return `${API_HOST}${photoUrl}`;
};


// Properties
export const getProperties = async (filters = {}) => {
    const response = await api.get('/properties', {
        params: filters
    });
    return response.data;
};

export const getProperty = async (propertyId) => {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
};

export const createProperty = async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
};

export const updateProperty = async (propertyId, propertyData) => {
    const response = await api.patch(`/properties/${propertyId}`, propertyData);
    return response.data;
};

export const deleteProperty = async (propertyId) => {
    const response = await api.delete(`/properties/${propertyId}`);
    return response.data;
};

export const getPropertyContact = async (propertyId) => {
    const response = await api.get(`/properties/${propertyId}/contact`);
    return response.data;
};


// User State endpoint: /me
export const getCurrentUser = async () => {
    const response = await api.get('/me');
    return response.data;
};

export const getMyListedProperties = async () => {
    const response = await api.get('/me/properties');
    return response.data;
};

export const getMyFavorites = async () => {
    const response = await api.get('/me/favorites');
    return response.data;
};

export const toggleFavorite = async (propertyId) => {
    const response = await api.post(`/me/favorites/${propertyId}`);
    return response.data;
};

export const getMyContactedProperties = async () => {
    const response = await api.get('/me/contacted');
    return response.data;
};

export default api;