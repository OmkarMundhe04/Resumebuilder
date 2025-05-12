import React from 'react';
import './Minimal.css';

const ResumeTemplateMinimal = ({ data }) => {
  return (
    <div className="resume-template">
      <h1>{data.name}</h1>
      <p>{data.email} • {data.phone}</p>

      <hr />

      <div>
        <h4>Summary</h4>
        <p>{data.summary || 'An enthusiastic developer ready to contribute!'}</p>
      </div>

      <div>
        <h4>Experience</h4>
        {data.experience.map((exp, index) => (
          <p key={index}>{exp.role}, {exp.company}</p>
        ))}
      </div>

      <div>
        <h4>Education</h4>
        {data.education.map((edu, index) => (
          <p key={index}>{edu.degree} - {edu.university}</p>
        ))}
      </div>
    </div>
  );
};

export default ResumeTemplateMinimal;
