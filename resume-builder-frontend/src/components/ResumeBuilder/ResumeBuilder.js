import React, { useState } from 'react';
import './ResumeBuilder.css';
import ResumeTemplateClassic from './ResumeTemplateClassic';
import ResumeTemplateModern from './ResumeTemplateModern';
import ResumeTemplateMinimal from './ResumeTemplateMinimal';

import './Classic.css';
import './Modern.css';
import './Minimal.css';

const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    title: '',
    experience: [{ company: '', role: '', years: '' }],
    education: [{ degree: '', university: '', year: '' }],
    skills: '',
    phone: '',
    summary: '',
  });

  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResumeData({ ...resumeData, [name]: value });
  };

  const handleDynamicChange = (e, index, field) => {
    const { name, value } = e.target;
    const updatedArray = [...resumeData[field]];
    updatedArray[index][name] = value;
    setResumeData({ ...resumeData, [field]: updatedArray });
  };

  const addField = (field) => {
    const emptyItem = field === 'experience'
      ? { company: '', role: '', years: '' }
      : { degree: '', university: '', year: '' };

    const updatedArray = [...resumeData[field], emptyItem];
    setResumeData({ ...resumeData, [field]: updatedArray });
  };

  const removeField = (field, index) => {
    const updatedArray = resumeData[field].filter((_, i) => i !== index);
    setResumeData({ ...resumeData, [field]: updatedArray });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Resume saved successfully!');
    // Add your save to backend logic here
  };

  return (
    <div className="resume-builder">
      <h2 className="title">Build Your Resume</h2>
      <form className="form-container" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="input-group">
          <input
            type="text"
            name="name"
            value={resumeData.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            name="email"
            value={resumeData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            type="text"
            name="title"
            value={resumeData.title}
            onChange={handleChange}
            placeholder="Resume Title"
            required
          />
          <input
            type="text"
            name="phone"
            value={resumeData.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
          />
          <textarea
            name="summary"
            value={resumeData.summary}
            onChange={handleChange}
            placeholder="Summary (optional)"
          />
        </div>

        {/* Experience */}
        <div className="section-title">Experience</div>
        {resumeData.experience.map((exp, index) => (
          <div className="input-group" key={index}>
            <input
              type="text"
              name="company"
              value={exp.company}
              onChange={(e) => handleDynamicChange(e, index, 'experience')}
              placeholder="Company"
            />
            <input
              type="text"
              name="role"
              value={exp.role}
              onChange={(e) => handleDynamicChange(e, index, 'experience')}
              placeholder="Role"
            />
            <input
              type="number"
              name="years"
              value={exp.years}
              onChange={(e) => handleDynamicChange(e, index, 'experience')}
              placeholder="Years"
            />
            <button
              type="button"
              onClick={() => removeField('experience', index)}
              className="remove-field-btn"
            >
              Remove Experience
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addField('experience')} className="add-field-btn">
          Add Experience
        </button>

        {/* Education */}
        <div className="section-title">Education</div>
        {resumeData.education.map((edu, index) => (
          <div className="input-group" key={index}>
            <input
              type="text"
              name="degree"
              value={edu.degree}
              onChange={(e) => handleDynamicChange(e, index, 'education')}
              placeholder="Degree"
            />
            <input
              type="text"
              name="university"
              value={edu.university}
              onChange={(e) => handleDynamicChange(e, index, 'education')}
              placeholder="University"
            />
            <input
              type="number"
              name="year"
              value={edu.year}
              onChange={(e) => handleDynamicChange(e, index, 'education')}
              placeholder="Year"
            />
            <button
              type="button"
              onClick={() => removeField('education', index)}
              className="remove-field-btn"
            >
              Remove Education
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addField('education')} className="add-field-btn">
          Add Education
        </button>

        {/* Skills */}
        <div className="input-group">
          <input
            type="text"
            name="skills"
            value={resumeData.skills}
            onChange={handleChange}
            placeholder="Skills (comma separated)"
          />
        </div>

        {/* Template Selector */}
        <div className="input-group">
          <label htmlFor="template-select">Choose Template:</label>
          <select
            id="template-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn">Save Resume</button>
      </form>

{/* Template Selector Outside for Debugging */}
<h3 style={{ marginTop: "20px" }}>Choose a Template</h3>
<select
  value={selectedTemplate}
  onChange={(e) => setSelectedTemplate(e.target.value)}
  style={{
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "20px"
  }}
>
  <option value="classic">Classic</option>
  <option value="modern">Modern</option>
  <option value="minimal">Minimal</option>
</select>

      {/* Template Preview */}
      {selectedTemplate === 'classic' && <ResumeTemplateClassic data={resumeData} />}
      {selectedTemplate === 'modern' && <ResumeTemplateModern data={resumeData} />}
      {selectedTemplate === 'minimal' && <ResumeTemplateMinimal data={resumeData} />}

      {/* Print */}
      <button onClick={handlePrint} className="print-btn">Print Resume</button>
    </div>
  );
};

export default ResumeBuilder;
