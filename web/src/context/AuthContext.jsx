import { createContext, useState } from 'react';

import { login as loginApi } from '../services/api';

// Authentication state
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(
        () => localStorage.getItem('token')
    );

    const isLoggedIn = Boolean(token);

    const login = async (credentials) => {
        const data = await loginApi(credentials);

        localStorage.setItem('token', data.token);
        setToken(data.token);

        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isLoggedIn,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};