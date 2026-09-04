const express = require('express');
const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const CoverLetter = require('../models/CoverLetter');
const ShareLink = require('../models/ShareLink');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/privacy/export-data
// @desc    Export all user data as complete, structured JSON (GDPR Data Portability)
// @access  Private
router.get('/export-data', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password');
    const profile = await CareerProfile.findOne({ userId });
    const resumes = await Resume.find({ userId });
    const applications = await Application.find({ userId });
    const coverLetters = await CoverLetter.find({ userId });
    const shareLinks = await ShareLink.find({ userId }).select('-passwordHash');

    const exportBundle = {
      metadata: {
        platform: 'Career Document Platform (ResumeBuilder)',
        exportDate: new Date().toISOString(),
        userEmail: user?.email,
        totalResumes: resumes.length,
        totalApplications: applications.length,
        totalCoverLetters: coverLetters.length
      },
      userAccount: user,
      careerProfile: profile,
      resumes,
      applications,
      coverLetters,
      shareLinks
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=CareerData_Export_${user.username || 'User'}.json`);
    res.status(200).send(JSON.stringify(exportBundle, null, 2));
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/privacy/delete-account
// @desc    Permanently wipe all user data, resumes, profile, applications, and account (GDPR Erasure)
// @access  Private
router.delete('/delete-account', auth, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Delete all user resources in parallel
    await Promise.all([
      User.deleteOne({ _id: userId }),
      CareerProfile.deleteOne({ userId }),
      Resume.deleteMany({ userId }),
      Application.deleteMany({ userId }),
      CoverLetter.deleteMany({ userId }),
      ShareLink.deleteMany({ userId })
    ]);

    res.status(200).json({
      success: true,
      message: 'Your account and all associated resumes, applications, and profile data have been permanently erased.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
