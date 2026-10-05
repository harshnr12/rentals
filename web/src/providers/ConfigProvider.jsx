import { useEffect, useState } from 'react';
import ConfigContext from '../context/ConfigContext.js';
import { getConfig } from '../services/api.js';

function ConfigProvider({ children }) {

    // Stored strictly in RAM
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (config !== null) {
            return;
        }
        const loadConfig = async () => {
            try {
                const data = await getConfig();
                setConfig(data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);         // runs exactly once on startup

    return (
        <ConfigContext.Provider
            value={{
                config,
                loading,
                error
            }}>
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigProvider;