// src/components/ResumeBuilder/ProfessionalResumeTemplate.js
import React from 'react';

const ResumeTemplate = ({ data }) => {
  return (
    <div className="resume-template">
      <h3>{data.name}</h3>
      <p>{data.title}</p>
      <p>{data.email}</p>

      <div className="section">
        <h4>Experience</h4>
        {data.experience.map((exp, index) => (
          <div key={index}>
            <p>{exp.company} - {exp.role} ({exp.years} years)</p>
          </div>
        ))}
      </div>

      <div className="section">
        <h4>Education</h4>
        {data.education.map((edu, index) => (
          <div key={index}>
            <p>{edu.degree} from {edu.university} ({edu.year})</p>
          </div>
        ))}
      </div>

      <div className="section">
        <h4>Skills</h4>
        <p>{data.skills}</p>
      </div>

      <div className="section">
        <h4>Template</h4>
        <p>{data.template}</p>
      </div>
    </div>
  );
};

export default ResumeTemplate;
