import { useState } from 'react';
import AuthContext from '../context/AuthContext.js';
import { login as loginApi, signup as signupApi } from '../services/api.js';

function AuthProvider({ children }) {
    // Read initial token from localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    const isLoggedIn = Boolean(token);

    const login = async (credentials) => {
        const data = await loginApi(credentials);
        localStorage.setItem('token', data.token);
        setToken(data.token);
        return data;
    };

    const signup = async (userData) => {
        const data = await signupApi(userData);
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
                signup,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;