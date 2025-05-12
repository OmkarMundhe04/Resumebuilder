import React, { useState } from "react";
import "./Classic.css"; // Ensure Classic.css is included

const ClassicResumeBuilder = () => {
  const [theme, setTheme] = useState("classic"); // Default theme

  const handleFieldChange = (e, field) => {
    // Handle input changes, could be used for form data management
    console.log(`${field}: ${e.target.value}`);
  };

  return (
    <div className={`resume-builder ${theme}`}>
      <div className={`title ${theme}`}>Classic Resume Builder</div>

      {/* Form Section */}
      <div className={`form-container ${theme}`}>
        {/* Personal Information Section */}
        <div className="section">
          <div className={`section-title ${theme}`}>Personal Information</div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              onChange={(e) => handleFieldChange(e, "name")}
            />
            <input
              type="email"
              placeholder="Email Address"
              onChange={(e) => handleFieldChange(e, "email")}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              onChange={(e) => handleFieldChange(e, "phone")}
            />
          </div>
        </div>

        {/* Education Section */}
        <div className="section">
          <div className={`section-title ${theme}`}>Education</div>
          <div className="input-group">
            <input
              type="text"
              placeholder="University"
              onChange={(e) => handleFieldChange(e, "university")}
            />
            <input
              type="text"
              placeholder="Degree"
              onChange={(e) => handleFieldChange(e, "degree")}
            />
            <input
              type="text"
              placeholder="Graduation Year"
              onChange={(e) => handleFieldChange(e, "gradYear")}
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="section">
          <div className={`section-title ${theme}`}>Skills</div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Skill 1"
              onChange={(e) => handleFieldChange(e, "skill1")}
            />
            <input
              type="text"
              placeholder="Skill 2"
              onChange={(e) => handleFieldChange(e, "skill2")}
            />
          </div>
        </div>

        {/* Add Field Button */}
        <button className={`add-field-btn ${theme}`}>Add Field</button>

        {/* Submit Button */}
        <button className={`submit-btn ${theme}`}>Generate Resume</button>
      </div>

      {/* Resume Preview Section */}
      <div className={`preview-section ${theme}`}>
        <div className="resume-template">
          <h3>John Doe</h3>
          <div className="section">
            <h4>Personal Information</h4>
            <p>Email: john.doe@example.com</p>
            <p>Phone: 123-456-7890</p>
          </div>
          <div className="section">
            <h4>Education</h4>
            <p>University: ABC University</p>
            <p>Degree: Computer Science</p>
            <p>Graduation Year: 2025</p>
          </div>
          <div className="section">
            <h4>Skills</h4>
            <p>JavaScript, React, Node.js</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicResumeBuilder;
