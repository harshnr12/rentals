import { useState } from 'react';

import AuthContext from '../context/AuthContext';
import { login as loginApi } from '../services/api';

function AuthProvider({ children }) {

    // Authentication state with lazy initialization from localStorage
    const [token, setToken] = useState(
        () => localStorage.getItem('token')
    );

    const isLoggedIn = token !== null;

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
                isLoggedIn,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;