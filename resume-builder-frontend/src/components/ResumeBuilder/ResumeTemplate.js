import React, { useState } from "react";
import "./Classic.css";  // Classic Template
import "./Modern.css";   // Modern Template
import "./Minimal.css";  // Minimal Template

const ResumeTemplate = () => {
  // Default set to "resume-template"
  const [selectedTemplate, setSelectedTemplate] = useState("resume-template");

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
  };

  return (
    <div className="resume-builder">
      {/* Template Selector */}
      <div className="template-selector">
        <label htmlFor="template">Choose a Template:</label>
        <select id="template" value={selectedTemplate} onChange={handleTemplateChange}>
          <option value="resume-template">Default (Resume Template)</option> {/* Default Template Option */}
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      {/* Resume Template Preview */}
      <div className={`preview-section ${selectedTemplate}`}>
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

export default ResumeTemplate;
