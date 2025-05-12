import logo from "./assets/images/logo.png";
import React, { useState, useEffect } from "react";
import "./App.css";
import SaveResume from "./components/SaveResume";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResumeBuilder from "./pages/ResumeBuilder";

function App() {
  const [resumeSaved, setResumeSaved] = useState(false);
  const [page, setPage] = useState("register");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setPage("home");
    } else {
      setIsLoggedIn(false);
      setPage("register");
    }

    // Load theme from localStorage
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.body.setAttribute("data-theme", storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.setAttribute("data-theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setPage("login");
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setPage("home");
  };

  const handleSaveResume = async () => {
    try {
      await SaveResume();
      setResumeSaved(true);
    } catch (error) {
      setResumeSaved(false);
      console.error("Error saving resume:", error);
    }
  };

  const renderPage = () => {
    if (!isLoggedIn && (page === "resume-builder" || page === "home")) {
      setPage("login");
      return <Login setPage={setPage} setIsLoggedIn={setIsLoggedIn} onLoginSuccess={handleLoginSuccess} />;
    }

    switch (page) {
      case "home":
        return <Home setPage={setPage} />;
      case "login":
        return <Login setPage={setPage} setIsLoggedIn={setIsLoggedIn} onLoginSuccess={handleLoginSuccess} />;
      case "register":
        return <Register setPage={setPage} />;
      case "resume-builder":
        return (
          <ResumeBuilder
            setPage={setPage}
            onSaveResume={handleSaveResume}
            resumeSaved={resumeSaved}
          />
        );
      default:
        return <Login setPage={setPage} setIsLoggedIn={setIsLoggedIn} onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-container">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src={logo} alt="Logo" className="navbar-logo" style={{ height: "30px" }} />
            <span className="navbar-text">
              build<span style={{ color: "#007bff" }}>resume</span>
            </span>
          </div>

          <div className="nav-links">
            <button onClick={toggleTheme}>
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
            {isLoggedIn ? (
              <>
                <button onClick={() => setPage("home")}>Home</button>
                <button onClick={() => setPage("resume-builder")}>Resume Builder</button>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => setPage("login")}>Login</button>
                <button onClick={() => setPage("register")}>Register</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>{renderPage()}</main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content text-center">
            <p className="fs-15">
              &copy; {new Date().getFullYear()} build
              <span style={{ color: "#007bff" }}>.resume</span> — All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
