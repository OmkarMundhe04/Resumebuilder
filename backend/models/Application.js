const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  dueDate: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: false });

const interviewStageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  stageName: { type: String, required: true }, // e.g. Phone Screen, Technical, Executive
  date: { type: String, default: '' },
  interviewer: { type: String, default: '' },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position/Role is required'],
    trim: true
  },
  location: {
    type: String,
    default: ''
  },
  jobUrl: {
    type: String,
    default: ''
  },
  jobDescription: {
    type: String,
    default: ''
  },
  salary: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Wishlist', 'Saved', 'Applied', 'Screening', 'Assessment', 'Interview', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'Applied'
  },
  dateApplied: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  deadline: {
    type: String,
    default: ''
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  coverLetterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoverLetter',
    default: null
  },
  stages: [interviewStageSchema],
  reminders: [reminderSchema],
  notes: {
    type: String,
    default: ''
  },
  nextAction: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

applicationSchema.index({ userId: 1, status: 1, dateApplied: -1 });

module.exports = mongoose.model('Application', applicationSchema);
