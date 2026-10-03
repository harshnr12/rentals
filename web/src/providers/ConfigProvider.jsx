import { useEffect, useState } from 'react';

import ConfigContext from '../context/ConfigContext.js';
import { getConfig } from '../services/api.js';

function ConfigProvider({ children }) {

    // Configuration state with lazy initialization from localStorage
    const [config, setConfig] = useState(() => {
        const savedConfig = localStorage.getItem('config');
        return savedConfig ? JSON.parse(savedConfig) : null;
    });

    // Load only when configuration is not already cached
    const [loading, setLoading] = useState(config === null);

    // Error from configuration request
    const [error, setError] = useState(null);

    useEffect(() => {
        if (config !== null) {
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

export default ConfigProvider;