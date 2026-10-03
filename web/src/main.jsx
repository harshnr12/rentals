import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App.jsx';

import AuthProvider from './providers/AuthProvider.jsx';
import ConfigProvider from './providers/ConfigProvider.jsx';
import UserDataProvider from './providers/UserDataProvider.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <ConfigProvider>
            <AuthProvider>
                <UserDataProvider>
                    <App />
                </UserDataProvider>
            </AuthProvider>
        </ConfigProvider>
    </StrictMode>
);