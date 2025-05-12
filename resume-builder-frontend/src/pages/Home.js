import React from 'react';
import './Home.css';
import logo from "../assets/images/logo.png";
import heroImage from "../assets/images/hero-image.png";
import feature1 from "../assets/images/feature-1.svg";
import feature2 from "../assets/images/feature-2.svg";
import feature3 from "../assets/images/feature-3.svg";

function Home({ setPage }) {
  const currentYear = new Date().getFullYear();

  const handleResumeClick = () => {
    if (typeof setPage === 'function') {
      setPage("resume-builder");
    } else {
      window.location.href = "/resume";
    }
  };

  return (
    <div className="home">
      <nav className="navbar">
        <div className="container navbar-container">
          <div className="navbar-brand">
            <img src={logo} alt="Logo" className="navbar-logo" />
            <span className="navbar-text">Build<span>Resume</span></span>
          </div>
          <button onClick={handleResumeClick} className="btn create-btn">Create My Resume</button>
        </div>
      </nav>

      <header className="hero-section">
        <div className="container hero-content">
          <div className="hero-text">
            <h1>Be the <span>Top 2%</span> in your job search!</h1>
            <p>
              Use field-tested templates, built-in prompts, and an AI-powered builder that guides you through a professional resume in minutes.
            </p>
            <button onClick={handleResumeClick} className="btn hero-btn">Create My Resume</button>
          </div>
          <div className="hero-image">
            <img src={heroImage} alt="Resume Preview" />
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="container features-container">
          <div className="feature-card">
            <img src={feature1} alt="Feature 1" />
            <h3>Job-Winning Templates</h3>
            <p>Built with input from professional recruiters to make your resume stand out.</p>
          </div>
          <div className="feature-card">
            <img src={feature2} alt="Feature 2" />
            <h3>Fast and Easy</h3>
            <p>Just enter your info, pick a design, and download your job-ready resume instantly.</p>
          </div>
          <div className="feature-card">
            <img src={feature3} alt="Feature 3" />
            <h3>Recruiter Approved</h3>
            <p>Our resumes are tested by hiring professionals across tech and business roles.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container text-center">
          <p>&copy; {currentYear} BuildResume. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
