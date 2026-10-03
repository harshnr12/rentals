import { BrowserRouter, Routes, Route } from 'react-router';

import Home from './screens/Home.jsx';
import Search from './screens/Search.jsx';
import PropertyDetails from './screens/PropertyDetails.jsx';
import Login from './screens/Login.jsx';
import Signup from './screens/Signup.jsx';
import Favorites from './screens/Favorites.jsx';
import Contacted from './screens/Contacted.jsx';
import Profile from './screens/Profile.jsx';
import MyProperties from './screens/MyProperties.jsx';
import AddProperty from './screens/AddProperty.jsx';
import EditProperty from './screens/EditProperty.jsx';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/properties" element={<Search />} />

                <Route
                    path="/properties/:id"
                    element={<PropertyDetails />}
                />

                <Route path="/login" element={<Login />} />

                <Route path="/signup" element={<Signup />} />

                <Route path="/favorites" element={<Favorites />} />

                <Route path="/contacted" element={<Contacted />} />

                <Route path="/profile" element={<Profile />} />

                <Route
                    path="/my-properties"
                    element={<MyProperties />}
                />

                <Route
                    path="/properties/new"
                    element={<AddProperty />}
                />

                <Route
                    path="/properties/:id/edit"
                    element={<EditProperty />}
                />
            </Routes>
        </BrowserRouter>
    );
}