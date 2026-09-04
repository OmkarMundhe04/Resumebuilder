const mongoose = require('mongoose');
const crypto = require('crypto');
const genId = () => crypto.randomBytes(8).toString('hex');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required for saving a resume"]
  },
  title: {
    type: String,
    default: 'Untitled Resume',
    trim: true
  },
  targetRole: {
    type: String,
    default: '',
    trim: true
  },
  targetCompany: {
    type: String,
    default: '',
    trim: true
  },
  template: {
    type: String,
    enum: [
      'ats-classic',
      'modern-professional',
      'technical',
      'student-graduate',
      'executive',
      'academic',
      'minimal',
      'creative',
      'swiss-clean',
      'silicon-valley',
      'corporate-navy',
      'emerald-compact',
      'tokyo-minimal',
      'nordic-slate',
      'ruby-executive',
      'berlin-modern'
    ],
    default: 'ats-classic'
  },
  version: {
    type: Number,
    default: 1
  },
  parentResumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  tags: [{ type: String }],
  
  // Canonical Content Sections
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
    image: { type: String, default: '' }
  },

  sectionOrder: {
    type: [String],
    default: [
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'publications',
      'awards',
      'volunteer',
      'custom'
    ]
  },

  sectionVisibility: {
    summary: { type: Boolean, default: true },
    experience: { type: Boolean, default: true },
    education: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    certifications: { type: Boolean, default: true },
    publications: { type: Boolean, default: true },
    awards: { type: Boolean, default: true },
    volunteer: { type: Boolean, default: true },
    custom: { type: Boolean, default: true }
  },

  experiences: [{
    id: { type: String, default: genId },
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    isCurrent: { type: Boolean, default: false },
    bullets: [{
      id: { type: String, default: genId },
      text: { type: String, default: '' },
      evidence: {
        role: { type: String, default: '' },
        task: { type: String, default: '' },
        technology: { type: String, default: '' },
        outcome: { type: String, default: '' },
        metric: { type: String, default: '' }
      },
      status: { type: String, default: 'VERIFIED' }
    }]
  }],

  education: [{
    id: { type: String, default: genId },
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    fieldOfStudy: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    gpa: { type: String, default: '' },
    coursework: [{ type: String }],
    honors: [{ type: String }]
  }],

  skills: [{
    id: { type: String, default: genId },
    name: { type: String, default: '' },
    note: { type: String, default: '' },
    category: { type: String, default: '' },
    proficiency: { type: String, default: '' },
    status: { type: String, default: 'VERIFIED' }
  }],

  projects: [{
    id: { type: String, default: genId },
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    role: { type: String, default: '' },
    technologies: [{ type: String }],
    link: { type: String, default: '' },
    repoLink: { type: String, default: '' },
    outcome: { type: String, default: '' },
    bullets: [{
      id: { type: String, default: genId },
      text: { type: String, default: '' }
    }]
  }],

  certifications: [{
    id: { type: String, default: genId },
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    credentialId: { type: String, default: '' },
    credentialUrl: { type: String, default: '' }
  }],

  publications: [{
    id: { type: String, required: true },
    title: { type: String, default: '' },
    publisher: { type: String, default: '' },
    date: { type: String, default: '' },
    url: { type: String, default: '' },
    description: { type: String, default: '' }
  }],

  awards: [{
    id: { type: String, required: true },
    title: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    description: { type: String, default: '' }
  }],

  volunteer: [{
    id: { type: String, required: true },
    organization: { type: String, default: '' },
    role: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    description: { type: String, default: '' }
  }],

  customSections: [{
    id: { type: String, required: true },
    title: { type: String, default: 'Custom Section' },
    content: { type: String, default: '' }
  }],

  formatting: {
    fontFamily: { type: String, default: 'Inter' },
    fontSize: { type: String, default: 'medium' }, // small, medium, large
    lineSpacing: { type: String, default: 'normal' }, // tight, normal, relaxed
    margins: { type: String, default: 'normal' }, // compact, normal, spacious
    paperSize: { type: String, enum: ['a4', 'letter'], default: 'a4' },
    accentColor: { type: String, default: '#0284c7' }
  },

  jobDescription: {
    rawText: { type: String, default: '' },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    matchScore: { type: Number, default: 0 }
  },

  health: {
    parserSafety: { type: Number, default: 95 },
    jobAlignment: { type: Number, default: 85 },
    evidenceStrength: { type: Number, default: 90 },
    readability: { type: Number, default: 95 },
    accessibility: { type: Number, default: 98 },
    completeness: { type: Number, default: 90 },
    formattingSafety: { type: Number, default: 100 },
    overall: { type: Number, default: 93 }
  }
}, {
  timestamps: true
});

// Index for efficient query by user and archive status
resumeSchema.index({ userId: 1, isArchived: 1, updatedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
