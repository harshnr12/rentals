import { BrowserRouter, Routes, Route } from 'react-router';
import Navbar from './components/Navbar.jsx';
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

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>

                {/* 1. Public Browsing */}
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Search />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />

                {/* 2. Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* 3. User Dashboard / Personal Collections */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/contacted" element={<Contacted />} />

                {/* 4. Owner Listing Management */}
                <Route path="/my-listings" element={<MyProperties />} />
                <Route path="/listings/new" element={<AddProperty />} />
                <Route path="/listings/:id/edit" element={<EditProperty />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
