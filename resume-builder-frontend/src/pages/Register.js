import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Register.css";
import img1 from "../assets/images/register1.png";
import img2 from "../assets/images/register2.png";
import img3 from "../assets/images/register3.png";

const Register = ({ setPage, onLoginSuccess, setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const images = [img1, img2, img3];
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData);
      if (response.status === 201 || response.data.success) {
        alert("User registered successfully.");
        setPage("login");
      } else {
        alert("Unexpected response. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      if (error.response?.status === 400) {
        alert("User already exists. Try logging in.");
      } else {
        alert(error.response?.data?.message || "Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-left">
        <h1>
          Create your <span style={{ color: "#007bff" }}>resume</span> <br />
          with ease 🚀
        </h1>
        <p>
          Build your professional resume in minutes using our user-friendly platform.
        </p>
        <img
          src={images[imageIndex]}
          alt="Illustration"
          className="register-illustration"
        />
      </div>

      <div className="register-form-box">
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to begin crafting your future</p>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="register-btn">Register</button>
        </form>
        <p className="footer-text">
          Already have an account?{" "}
          <span onClick={() => setPage("login")} className="link-text">Login here</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
