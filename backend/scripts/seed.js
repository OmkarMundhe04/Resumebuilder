/**
 * Safe Development Persona Seed Script
 * Pre-populates a realistic candidate persona for local testing and demonstration.
 * Safety rule: MUST NEVER execute in production!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const Resume = require('../models/Resume');
const Application = require('../models/Application');

const generateId = () => crypto.randomBytes(8).toString('hex');

const runSeed = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ SAFETY ABORT: Seeding is strictly forbidden in production!');
    process.exit(1);
  }

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resumebuilder';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to database for development seeding...');

  // 1. Create Demo User
  const demoEmail = 'demo@resumebuilder.local';
  await User.deleteOne({ $or: [{ email: demoEmail }, { username: 'alexmorgan' }] });
  const passwordHash = await bcrypt.hash('DemoPassword123!', 10);

  const demoUser = await User.create({
    name: 'Alex Morgan',
    username: 'alexmorgan',
    email: demoEmail,
    password: passwordHash
  });

  console.log(`✓ Created demo user: ${demoEmail} (Password: DemoPassword123!)`);

  // 2. Create Master Career Profile (Truth DB)
  await CareerProfile.deleteOne({ userId: demoUser._id });

  const profile = await CareerProfile.create({
    userId: demoUser._id,
    personal: {
      fullName: 'Alex Morgan',
      title: 'Senior Full-Stack Engineer',
      email: demoEmail,
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      website: 'https://alexmorgan.dev',
      linkedin: 'https://linkedin.com/in/alexmorgan',
      github: 'https://github.com/alexmorgan',
      summary: 'Results-driven full-stack software engineer with 5+ years of experience architecting high-throughput distributed systems and accessible React web applications.'
    },
    experiences: [
      {
        id: generateId(),
        company: 'CloudScale Technologies',
        role: 'Senior Full-Stack Engineer',
        location: 'San Francisco, CA',
        startDate: '2022-03',
        endDate: '',
        isCurrent: true,
        responsibilities: 'Lead core platform architecture and API development.',
        bullets: [
          {
            id: generateId(),
            text: 'Architected scalable microservices using Node.js and PostgreSQL, supporting 500,000+ daily active users with 99.99% uptime.',
            evidence: { role: 'Senior Engineer', task: 'Microservices architecture', technology: 'Node.js, PostgreSQL', outcome: 'High availability', metric: '500k DAU, 99.99% uptime' },
            status: 'VERIFIED'
          },
          {
            id: generateId(),
            text: 'Refactored client-side rendering pipeline in React, reducing Largest Contentful Paint (LCP) by 450ms across core checkout pages.',
            evidence: { role: 'Senior Engineer', task: 'Client rendering refactoring', technology: 'React, Webpack', outcome: 'Performance boost', metric: '450ms LCP reduction' },
            status: 'VERIFIED'
          }
        ],
        status: 'VERIFIED'
      }
    ],
    education: [
      {
        id: generateId(),
        institution: 'University of California, Berkeley',
        degree: 'B.S. in Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2016-09',
        endDate: '2020-05',
        gpa: '3.85 / 4.0',
        coursework: ['Distributed Systems', 'Data Structures & Algorithms', 'Database Systems'],
        honors: ["Dean's Honors List (All Semesters)"],
        status: 'VERIFIED'
      }
    ],
    skills: [
      { id: generateId(), name: 'JavaScript (ES6+)', category: 'Technical', proficiency: 'Expert', verified: true, status: 'VERIFIED' },
      { id: generateId(), name: 'TypeScript', category: 'Technical', proficiency: 'Advanced', verified: true, status: 'VERIFIED' },
      { id: generateId(), name: 'React.js', category: 'Technical', proficiency: 'Expert', verified: true, status: 'VERIFIED' },
      { id: generateId(), name: 'Node.js', category: 'Technical', proficiency: 'Advanced', verified: true, status: 'VERIFIED' },
      { id: generateId(), name: 'MongoDB', category: 'Technical', proficiency: 'Advanced', verified: true, status: 'VERIFIED' },
      { id: generateId(), name: 'Docker', category: 'Tools', proficiency: 'Advanced', verified: true, status: 'VERIFIED' }
    ],
    projects: [
      {
        id: generateId(),
        name: 'Career Document & ATS Platform',
        description: 'High-performance SaaS platform generating accessible, parser-safe resumes with multi-metric health scoring.',
        role: 'Lead Architect',
        technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
        link: 'https://resumebuilder.demo',
        repoLink: 'https://github.com/alexmorgan/resumebuilder',
        status: 'VERIFIED'
      }
    ]
  });

  console.log('✓ Created Career Truth Profile');

  // 3. Create Canonical Resume
  await Resume.deleteMany({ userId: demoUser._id });

  await Resume.create({
    userId: demoUser._id,
    title: 'Alex Morgan — Senior Full-Stack Engineer',
    template: 'ats-classic',
    isSample: false,
    personal: profile.personal,
    experiences: profile.experiences,
    education: profile.education,
    skills: profile.skills,
    projects: profile.projects,
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'projects'],
    sectionVisibility: { personal: true, summary: true, experience: true, education: true, skills: true, projects: true }
  });

  console.log('✓ Created Canonical Resume');

  // 4. Create Sample Application Record
  await Application.deleteMany({ userId: demoUser._id });

  await Application.create({
    userId: demoUser._id,
    company: 'Stripe',
    position: 'Staff Full-Stack Engineer',
    location: 'San Francisco, CA',
    status: 'Interview',
    dateApplied: new Date().toISOString().split('T')[0],
    matchScore: 88,
    notes: 'Phone screening completed. Technical system design interview scheduled.'
  });

  console.log('✓ Created Sample Job Application');
  console.log('🎉 Development seed completed successfully!');
  process.exit(0);
};

runSeed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
