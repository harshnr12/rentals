import './Navbar.css';
import { Link, NavLink, useNavigate } from 'react-router';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext.js';

function Navbar() {
    const { isLoggedIn, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <header className="navbar">
            <Link to="/" className="navbar-logo">
                Rentals
            </Link>
            <nav className="navbar-links">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        isActive ? 'navbar-link active' : 'navbar-link'
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/properties"
                    end
                    className={({ isActive }) =>
                        isActive ? 'navbar-link active' : 'navbar-link'
                    }
                >
                    Search
                </NavLink>
                {isLoggedIn && (
                    <>
                        <NavLink
                            to="/favorites"
                            end
                            className={({ isActive }) =>
                                isActive ? 'navbar-link active' : 'navbar-link'
                            }
                        >
                            Favorites
                        </NavLink>
                        <NavLink
                            to="/contacted"
                            end
                            className={({ isActive }) =>
                                isActive ? 'navbar-link active' : 'navbar-link'
                            }
                        >
                            Contacted
                        </NavLink>
                        <NavLink
                            to="/my-properties"
                            end
                            className={({ isActive }) =>
                                isActive ? 'navbar-link active' : 'navbar-link'
                            }
                        >
                            My Properties
                        </NavLink>
                        <NavLink
                            to="/profile"
                            end
                            className={({ isActive }) =>
                                isActive ? 'navbar-link active' : 'navbar-link'
                            }
                        >
                            My Profile
                        </NavLink>
                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
                {!isLoggedIn && (
                    <>
                        <NavLink
                            to="/login"
                            end
                            className={({ isActive }) =>
                                isActive ? 'navbar-link active' : 'navbar-link'
                            }
                        >
                            Login
                        </NavLink>
                        <NavLink
                            to="/signup"
                            end
                            className={({ isActive }) =>
                                isActive ? 'navbar-link active' : 'navbar-link'
                            }
                        >
                            Signup
                        </NavLink>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Navbar;