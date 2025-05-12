const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const auth = require('../middleware/auth'); // JWT middleware

// @route   POST /api/resume/save
// @desc    Save resume data (only for logged-in users)
// @access  Private
router.post('/save', auth, async (req, res) => {
  try {
    const { personal, education, experience, skills, projects } = req.body;

    if (!personal || !education || !skills) {
      return res.status(400).json({ message: '❌ Required fields are missing' });
    }

    const newResume = new Resume({
      userId: req.user.userId, // from decoded JWT
      personal,
      education,
      experience,
      skills,
      projects,
    });

    await newResume.save();
    res.status(201).json({ message: '✅ Resume saved successfully!' });
  } catch (error) {
    console.error('❌ Error saving resume:', error.message);
    res.status(500).json({ message: '❌ Server error. Please try again later.' });
  }
});

// @route   GET /api/resume/my
// @desc    Get all resumes of the logged-in user
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.userId; // from decoded JWT
    const resumes = await Resume.find({ userId });

    res.status(200).json(resumes);
  } catch (error) {
    console.error('❌ Error fetching resumes:', error.message);
    res.status(500).json({ message: '❌ Server error. Please try again later.' });
  }
});

module.exports = router;
