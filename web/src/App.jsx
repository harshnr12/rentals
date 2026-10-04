import { BrowserRouter, Routes, Route } from 'react-router';
import Navbar from './components/Navbar.jsx';
import Home from './screens/Home.jsx';
import Search from './screens/Search.jsx';
import PropertyDetails from './screens/PropertyDetails.jsx';
import Login from './screens/Login.jsx';
import Signup from './screens/Signup.jsx';
import Favorites from './screens/Favorites.jsx';
import Contacted from './screens/Contacted.jsx';
import MyProfile from './screens/MyProfile.jsx';
import MyProperties from './screens/MyProperties.jsx';
import AddProperty from './screens/AddProperty.jsx';
import EditProperty from './screens/EditProperty.jsx';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Search />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/contacted" element={<Contacted />} />
                <Route path="/my-profile" element={<MyProfile />} />
                <Route path="/my-properties" element={<MyProperties />} />
                <Route path="/properties/new" element={<AddProperty />} />
                <Route path="/properties/:id/edit" element={<EditProperty />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;