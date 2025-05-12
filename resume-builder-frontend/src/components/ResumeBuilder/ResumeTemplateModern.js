import React from 'react';
import './Modern.css';

const ResumeTemplateModern = ({ data }) => {
  return (
    <div className="resume-template">
      <header>
        <h1>{data.name}</h1>
        <p>{data.title}</p>
        <p>{data.email} | {data.phone}</p>
      </header>

      <div className="grid">
        <div className="left-column">
          <h4>Skills</h4>
          <ul>
            {data.skills.split(',').map((skill, idx) => <li key={idx}>{skill.trim()}</li>)}
          </ul>
        </div>
        <div className="right-column">
          <h4>Experience</h4>
          {data.experience.map((exp, i) => (
            <p key={i}><strong>{exp.role}</strong> - {exp.company}</p>
          ))}

          <h4>Education</h4>
          {data.education.map((edu, i) => (
            <p key={i}>{edu.degree} - {edu.university}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplateModern;
