import { createContext, useEffect, useState } from 'react';
import { getConfig } from '../services/api';

// Application configuration
export const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(() => {
        const savedConfig = localStorage.getItem('config');

        return savedConfig ? JSON.parse(savedConfig) : null;
    });

    const [loading, setLoading] = useState(!config);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (config) {
            return;
        }

        const loadConfig = async () => {
            try {
                const data = await getConfig();

                localStorage.setItem('config', JSON.stringify(data));
                setConfig(data);

            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    return (
        <ConfigContext.Provider
            value={{
                config,
                loading,
                error
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};