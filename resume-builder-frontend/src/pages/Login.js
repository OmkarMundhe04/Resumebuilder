import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css";
import img1 from "../assets/images/login1.png";
import img2 from "../assets/images/login2.png";
import img3 from "../assets/images/login3.png";

const Login = ({ setPage, setIsLoggedIn, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [img1, img2, img3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.user?.username);
        setIsLoggedIn(true);
        onLoginSuccess();
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Incorrect email or password.");
      } else {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <h1>
          Welcome Back to <span style={{ color: "#007bff" }}>build.resume</span>
        </h1>
        <p>
          Securely login to manage your resume and job profile.
        </p>
        <img src={images[currentImageIndex]} alt="Login Visual" className="login-illustration" />
      </div>

      <div className="login-form-box">
        <h2>Sign In</h2>
        <p className="subtitle">Access your dashboard and resume tools</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="footer-text">
          Don't have an account? {" "}
          <span onClick={() => setPage("register")} className="link-text">Register here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
