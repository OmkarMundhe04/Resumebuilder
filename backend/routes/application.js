const express = require('express');
const crypto = require('crypto');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

const router = express.Router();

const generateId = () => crypto.randomBytes(8).toString('hex');

// @route   GET /api/applications
// @desc    Get all applications for the user with metrics
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user.userId })
      .populate('resumeId', 'title version')
      .populate('coverLetterId', 'title')
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate metrics
    const total = applications.length;
    const applied = applications.filter(a => a.status === 'Applied').length;
    const interviews = applications.filter(a => a.status === 'Interview').length;
    const offers = applications.filter(a => a.status === 'Offer').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;
    const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;

    res.status(200).json({
      success: true,
      metrics: {
        total,
        applied,
        interviews,
        offers,
        rejected,
        responseRate
      },
      applications
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/applications
// @desc    Create a new tracked job application
// @access  Private
router.post('/', auth, async (req, res, next) => {
  try {
    const companyName = req.body.company;
    const positionName = req.body.position || req.body.role;
    const stageStatus = req.body.status || req.body.stage || 'Applied';

    if (!companyName || !positionName) {
      return res.status(400).json({ success: false, message: 'Company and Position/Role are required.' });
    }

    const application = new Application({
      userId: req.user.userId,
      company: companyName.trim(),
      position: positionName.trim(),
      location: req.body.location?.trim() || '',
      jobUrl: req.body.jobUrl?.trim() || '',
      jobDescription: req.body.jobDescription || '',
      salary: req.body.salary?.trim() || '',
      status: stageStatus,
      dateApplied: req.body.dateApplied || req.body.appliedDate || new Date().toISOString().split('T')[0],
      deadline: req.body.deadline || '',
      matchScore: req.body.matchScore || 75,
      resumeId: req.body.resumeId || req.body.targetResumeId || null,
      coverLetterId: req.body.coverLetterId || null,
      notes: req.body.notes?.trim() || '',
      nextAction: req.body.nextAction?.trim() || ''
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application added to your tracker.',
      application
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/applications/:id
// @desc    Update application details, stage, notes, or reminders
// @access  Private
router.put('/:id', auth, async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const fields = [
      'company', 'position', 'location', 'jobUrl', 'jobDescription',
      'salary', 'status', 'dateApplied', 'deadline', 'resumeId',
      'coverLetterId', 'stages', 'reminders', 'notes', 'nextAction'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated.',
      application
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete an application
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await Application.deleteOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Application removed from tracker.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
