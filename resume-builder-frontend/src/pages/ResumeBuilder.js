import React, { useState, useEffect } from "react";
import "./ResumeBuilder.css"; // General CSS for Resume Builder page

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("resumeTemplate");
  const [resumeData, setResumeData] = useState({
    personal: { name: "", email: "", phone: "", address: "", summary: "", image: "" },
    experience: [{ company: "", role: "", dates: "", description: "" }],
    education: [{ school: "", degree: "", dates: "" }],
    skills: [""],
    projects: [{ name: "", link: "", description: "" }],
  });

  // Dynamically import CSS for the selected template
  useEffect(() => {
    const loadTemplateCSS = async () => {
      console.log("Loading CSS for:", selectedTemplate);
      // Dynamically import the CSS file based on the selected template
      const template = ["classic", "modern", "minimal", "resumeTemplate"].includes(selectedTemplate)
        ? selectedTemplate
        : "resumeTemplate";  // Default to resumeTemplate if not found
      await import(`../components/ResumeBuilder/${template.charAt(0).toUpperCase() + template.slice(1)}.css`);
    };
    loadTemplateCSS();
  }, [selectedTemplate]);

  const handleChange = (section, index, field, value) => {
    if (Array.isArray(resumeData[section])) {
      const updated = [...resumeData[section]];
      updated[index][field] = value;
      setResumeData({ ...resumeData, [section]: updated });
    } else {
      setResumeData({ ...resumeData, [section]: { ...resumeData[section], [field]: value } });
    }
  };

  const handleListChange = (section, index, value) => {
    const updated = [...resumeData[section]];
    updated[index] = value;
    setResumeData({ ...resumeData, [section]: updated });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setResumeData({
        ...resumeData,
        personal: { ...resumeData.personal, image: reader.result },
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const addItem = (section, template) => {
    setResumeData({ ...resumeData, [section]: [...resumeData[section], template] });
  };

  const removeItem = (section, index) => {
    const updated = [...resumeData[section]];
    updated.splice(index, 1);
    setResumeData({ ...resumeData, [section]: updated });
  };

  const handlePrint = () => window.print();

  const handleSaveResume = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/resume/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(resumeData),
      });
      const data = await response.json();
      if (response.ok) alert("Resume saved successfully!");
      else alert("Failed to save: " + data.message);
    } catch (error) {
      console.error(error);
      alert("Error saving resume.");
    }
  };

  return (
    <div className="resume-builder">
      <div className="form-section">
        <h1>Resume Builder</h1>

        {/* Template Selection Dropdown */}
        <label>Select Template:</label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="input-field"
        >
          <option value="resumeTemplate">Default Template</option>
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
        </select>

        <h2>Personal Info</h2>
        {Object.keys(resumeData.personal).map(
          (field) =>
            field !== "image" && (
              <input
                key={field}
                className="input-field"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={resumeData.personal[field]}
                onChange={(e) => handleChange("personal", null, field, e.target.value)}
              />
            )
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="input-field" />

        {/* Experience */}
        <h2>Work Experience</h2>
        {resumeData.experience.map((exp, i) => (
          <div key={i} className="section-block">
            {Object.keys(exp).map((field) => (
              <input
                key={field}
                className="input-field"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={exp[field]}
                onChange={(e) => handleChange("experience", i, field, e.target.value)}
              />
            ))}
            <button className="remove-btn" onClick={() => removeItem("experience", i)}>
              Remove
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={() => addItem("experience", { company: "", role: "", dates: "", description: "" })}>
          Add Experience
        </button>

        {/* Education */}
        <h2>Education</h2>
        {resumeData.education.map((edu, i) => (
          <div key={i} className="section-block">
            {Object.keys(edu).map((field) => (
              <input
                key={field}
                className="input-field"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={edu[field]}
                onChange={(e) => handleChange("education", i, field, e.target.value)}
              />
            ))}
            <button className="remove-btn" onClick={() => removeItem("education", i)}>
              Remove
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={() => addItem("education", { school: "", degree: "", dates: "" })}>
          Add Education
        </button>

        {/* Skills */}
        <h2>Skills</h2>
        {resumeData.skills.map((skill, i) => (
          <div key={i} className="section-block">
            <input
              className="input-field"
              placeholder="Skill"
              value={skill}
              onChange={(e) => handleListChange("skills", i, e.target.value)}
            />
            <button className="remove-btn" onClick={() => removeItem("skills", i)}>
              Remove
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={() => addItem("skills", "")}>
          Add Skill
        </button>

        {/* Projects */}
        <h2>Projects</h2>
        {resumeData.projects.map((proj, i) => (
          <div key={i} className="section-block">
            {Object.keys(proj).map((field) => (
              <input
                key={field}
                className="input-field"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={proj[field]}
                onChange={(e) => handleChange("projects", i, field, e.target.value)}
              />
            ))}
            <button className="remove-btn" onClick={() => removeItem("projects", i)}>
              Remove
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={() => addItem("projects", { name: "", link: "", description: "" })}>
          Add Project
        </button>

        <button onClick={handlePrint} className="print-btn">
          Print Resume
        </button>
        <button onClick={handleSaveResume} className="print-btn">
          Save Resume
        </button>
      </div>

      <div className={`preview-section ${selectedTemplate}`}>
        {resumeData.personal.image && <img src={resumeData.personal.image} alt="Profile" className="profile-image" />}
        <h1>{resumeData.personal.name}</h1>
        <p>
          {resumeData.personal.email} | {resumeData.personal.phone} | {resumeData.personal.address}
        </p>
        <p>{resumeData.personal.summary}</p>

        <h2>Work Experience</h2>
        {resumeData.experience.map((exp, i) => (
          <div key={i}>
            <strong>{exp.role}</strong> at {exp.company} ({exp.dates})
            <p>{exp.description}</p>
          </div>
        ))}

        <h2>Education</h2>
        {resumeData.education.map((edu, i) => (
          <div key={i}>
            <strong>{edu.degree}</strong>, {edu.school} ({edu.dates})
          </div>
        ))}

        <h2>Skills</h2>
        <ul>
          {resumeData.skills.map((skill, i) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>

        <h2>Projects</h2>
        {resumeData.projects.map((proj, i) => (
          <div key={i}>
            <strong>{proj.name}</strong>:{" "}
            <a href={proj.link} target="_blank" rel="noopener noreferrer">
              {proj.link}
            </a>
            <p>{proj.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeBuilder;
