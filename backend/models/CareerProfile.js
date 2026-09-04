const mongoose = require('mongoose');
const crypto = require('crypto');

const genId = () => crypto.randomBytes(8).toString('hex');

const bulletSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  text: { type: String, default: '' },
  evidence: {
    role: { type: String, default: '' },
    task: { type: String, default: '' },
    technology: { type: String, default: '' },
    outcome: { type: String, default: '' },
    metric: { type: String, default: '' }
  },
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  company: { type: String, default: '' },
  role: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  isCurrent: { type: Boolean, default: false },
  responsibilities: { type: String, default: '' },
  bullets: [bulletSchema],
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const educationSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  institution: { type: String, default: '' },
  degree: { type: String, default: '' },
  fieldOfStudy: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  gpa: { type: String, default: '' },
  coursework: [{ type: String }],
  honors: [{ type: String }],
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const skillSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  name: { type: String, default: '' },
  note: { type: String, default: '' },
  category: { 
    type: String, 
    default: '' 
  },
  proficiency: { 
    type: String, 
    default: '' 
  },
  verified: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  role: { type: String, default: '' },
  technologies: [{ type: String }],
  link: { type: String, default: '' },
  repoLink: { type: String, default: '' },
  outcome: { type: String, default: '' },
  bullets: [bulletSchema],
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  name: { type: String, default: '' },
  issuer: { type: String, default: '' },
  issueDate: { type: String, default: '' },
  expiryDate: { type: String, default: '' },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const publicationSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  title: { type: String, default: '' },
  publisher: { type: String, default: '' },
  date: { type: String, default: '' },
  url: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const awardSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  title: { type: String, default: '' },
  issuer: { type: String, default: '' },
  date: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const volunteerSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  organization: { type: String, default: '' },
  role: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const customSectionSchema = new mongoose.Schema({
  id: { type: String, default: genId },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  }
}, { _id: false });

const careerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personal: {
    fullName: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    summary: { type: String, default: '' },
    showPhoto: { type: Boolean, default: false },
    photoUrl: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  experiences: [experienceSchema],
  education: [educationSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  publications: [publicationSchema],
  awards: [awardSchema],
  volunteer: [volunteerSchema],
  customSections: [customSectionSchema],
  targetProfiles: [{
    id: { type: String, default: genId },
    title: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    targetSeniority: { type: String, default: 'Mid-Level' },
    targetIndustries: [{ type: String }],
    requiredSkills: [{ type: String }],
    idealSummary: { type: String, default: '' }
  }],
  portfolioSettings: {
    enabled: { type: Boolean, default: false },
    slug: { type: String, default: '' },
    theme: { type: String, default: 'minimal' },
    accentColor: { type: String, default: '#0284c7' },
    customDomain: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('CareerProfile', careerProfileSchema);
