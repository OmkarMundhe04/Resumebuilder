const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const { generateCoverLetterWithGemini } = require('../utils/geminiService');

async function testCoverLetterFlow() {
  console.log('--- Testing Cover Letter Generation Flow ---');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resumebuilder');

  // Find or create test candidate (fresher)
  const testCandidate = {
    fullName: 'Omkar Mundhe',
    title: 'Software Engineer Graduate',
    location: 'Pune, India',
    summary: 'Aspiring Software Engineer with a solid foundation in Python, full-stack web development, and database architecture.',
    hasProfessionalExperience: false,
    education: [
      {
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science and Engineering',
        institution: 'Pune Institute of Computer Technology',
        graduationDate: '2024',
        gpa: '8.8/10',
        coursework: ['Data Structures & Algorithms', 'Database Management', 'Object-Oriented Programming', 'Operating Systems'],
        honors: ['Dean\'s List', 'Academic Excellence Award']
      }
    ],
    skills: [
      { name: 'Python', category: 'Technical', proficiency: 'Advanced' },
      { name: 'SQL', category: 'Technical', proficiency: 'Advanced' },
      { name: 'React.js', category: 'Technical', proficiency: 'Intermediate' },
      { name: 'Node.js', category: 'Technical', proficiency: 'Intermediate' },
      { name: 'Git', category: 'Tools', proficiency: 'Advanced' },
      { name: 'MongoDB', category: 'Technical', proficiency: 'Intermediate' },
      { name: 'REST APIs', category: 'Technical', proficiency: 'Advanced' }
    ],
    projects: [
      {
        name: 'Ration Shop Appointment System',
        role: 'Lead Developer',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
        description: 'Developed an automated appointment scheduling platform for public distribution shops reducing citizen queue wait times.',
        highlights: ['Engineered RESTful endpoints and modular UI components with state management.']
      },
      {
        name: 'India Traffic Dashboard',
        role: 'Developer',
        technologies: ['Python', 'Streamlit', 'Pandas', 'SQL'],
        description: 'Built interactive visual data dashboard for traffic and density metrics across major cities.',
        highlights: ['Processed multi-source datasets and created clean analytical queries in SQL.']
      }
    ],
    experiences: [] // Fresher candidate!
  };

  const targetRole = 'Software Engineer – Graduate / Fresher';
  const company = 'TechNova Solutions';
  const hiringManager = 'Priya Sharma';
  const tone = 'technical';
  const jobDescription = `We are looking for a motivated Software Engineer Graduate to join our engineering team. The ideal candidate should have a strong foundation in Python, data structures and algorithms, SQL, REST APIs, Git, and software development principles. Experience with React.js, Node.js, MongoDB, cloud platforms, or AI/ML projects is a plus. The candidate will work with cross-functional teams to develop, test, debug, and maintain scalable software applications. Strong problem-solving, communication, and analytical skills are required. Candidates should demonstrate their technical abilities through academic, personal, or internship projects.`;

  console.log('\nInvoking Gemini Cover Letter Service...');
  const result = await generateCoverLetterWithGemini({
    candidateEvidence: testCandidate,
    targetRole,
    company,
    hiringManager,
    jobDescription,
    tone
  });

  if (result) {
    console.log('\n✅ SUCCESS: Gemini Returned Structured Cover Letter:');
    console.log('Subject:', result.subject);
    console.log('Quality Scores:', result.quality);
    console.log('Matched Skills:', result.matchedSkills);
    console.log('Evidence Used:', result.evidenceUsed);
    console.log('\n--- COVER LETTER TEXT ---\n');
    console.log(result.coverLetter);
    console.log('\n-------------------------\n');

    // Assertions
    const letter = result.coverLetter;
    const isAppropriateForFresher = !letter.includes('Throughout my career') && !letter.includes('proven track record') && !letter.includes('extensive industry experience');
    console.log('Verification: No inappropriate senior clichés:', isAppropriateForFresher ? '✓ PASS' : '❌ FAIL');
    console.log('Verification: Uses Hiring Manager name:', letter.includes('Priya Sharma') ? '✓ PASS' : '❌ FAIL');
    console.log('Verification: References verified candidate projects/skills:', (letter.includes('Python') || letter.includes('Ration Shop') || letter.includes('Traffic Dashboard')) ? '✓ PASS' : '❌ FAIL');
  } else {
    console.log('⚠️ Gemini call returned null (testing fallback)...');
  }

  await mongoose.disconnect();
}

testCoverLetterFlow().catch(console.error);
