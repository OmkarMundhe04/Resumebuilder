const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Cover Letter',
    trim: true
  },
  company: {
    type: String,
    default: '',
    trim: true
  },
  position: {
    type: String,
    default: '',
    trim: true
  },
  recipientName: {
    type: String,
    default: 'Hiring Manager'
  },
  recipientTitle: {
    type: String,
    default: ''
  },
  bodyParagraphs: [{
    id: { type: String, required: true },
    type: { type: String, enum: ['intro', 'experience', 'motivation', 'conclusion', 'custom'], default: 'experience' },
    content: { type: String, required: true },
    groundingNotes: { type: String, default: '' }
  }],
  tone: {
    type: String,
    enum: ['Professional', 'Confident', 'Direct', 'Academic', 'Creative', 'Formal', 'Conversational', 'Technical'],
    default: 'Professional'
  },
  length: {
    type: String,
    enum: ['Concise', 'Standard', 'Comprehensive'],
    default: 'Standard'
  },
  jobDescription: {
    type: String,
    default: ''
  },
  linkedResumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  }
}, {
  timestamps: true
});

coverLetterSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('CoverLetter', coverLetterSchema);
