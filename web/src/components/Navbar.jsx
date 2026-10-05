import './Navbar.css';
import { Link, NavLink, useNavigate } from 'react-router';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext.js';

function Navbar() {
    const { isLoggedIn, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <header className="navbar-header">
            <Link to="/" className="navbar-brand">Rentals</Link>
            <nav className="navbar-nav">
                <NavLink to="/" end>Home</NavLink>
                <NavLink to="/properties" end>Search</NavLink>
                {isLoggedIn ? (
                    <>
                        <NavLink to="/listings/new" end>Add a Listing</NavLink>
                        <NavLink to="/favorites" end>Favorites</NavLink>
                        <NavLink to="/contacted" end>Contacted</NavLink>
                        <NavLink to="/my-listings" end>My Listings</NavLink>
                        <NavLink to="/profile" end>Profile</NavLink>
                        <button type="button" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" end>Login</NavLink>
                        <NavLink to="/signup" end>Signup</NavLink>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Navbar;