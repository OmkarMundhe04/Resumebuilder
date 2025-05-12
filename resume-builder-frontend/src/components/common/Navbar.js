import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import './Navbar.css';  // Correct path to Navbar.css

const Navbar = () => {
    const [username, setUsername] = useState("");
    const location = useLocation();  // To get the current URL

    useEffect(() => {
        // Fetch the username from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.name) {
            setUsername(storedUser.name);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const isLoggedIn = localStorage.getItem("token"); // Check if token is present in localStorage

    // Check if we are on the /register page to conditionally render the Logout button
    const isRegisterPage = location.pathname === "/register";

    return (
        <nav className="navbar">
            <h2>Resume Builder</h2>
            <div className="nav-links">
                {isLoggedIn && username && <span className="welcome-text">Welcome, {username}</span>}
                <Link to="/">Home</Link>
                <Link to="/resume-builder">Build Resume</Link>

                {/* Only render the Logout button if the user is logged in and not on the register page */}
                {isLoggedIn && !isRegisterPage && (
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
