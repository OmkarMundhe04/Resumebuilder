const express = require('express');
const crypto = require('crypto');
const CareerProfile = require('../models/CareerProfile');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/security');
const {
  analyzeProject,
  suggestSkillsFromProfile,
  generateProjectDescription
} = require('../services/projectAnalyzerService');

const router = express.Router();

const generateId = () => crypto.randomBytes(8).toString('hex');

// @route   GET /api/career-profile
// @desc    Get user Career Profile (Source of Truth)
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    let profile = await CareerProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      profile = new CareerProfile({
        userId: req.user.userId,
        personal: {
          fullName: req.user.name,
          email: req.user.email
        }
      });
      await profile.save();
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/career-profile
// @desc    Update entire Career Profile or specific sections
// @access  Private
router.put('/', auth, async (req, res, next) => {
  try {
    const { 
      personal, 
      experiences, 
      education, 
      skills, 
      projects, 
      certifications, 
      publications, 
      awards, 
      volunteer, 
      customSections,
      targetProfiles,
      portfolioSettings
    } = req.body;

    let profile = await CareerProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      profile = new CareerProfile({ userId: req.user.userId });
    }

    if (personal !== undefined) {
      profile.personal = { ...(profile.personal?.toObject ? profile.personal.toObject() : profile.personal), ...personal };
    }
    if (experiences !== undefined) {
      profile.experiences = experiences.map(e => ({ ...e, id: e.id || generateId() }));
    }
    if (education !== undefined) {
      profile.education = education.map(e => ({ ...e, id: e.id || generateId() }));
    }
    if (skills !== undefined) {
      profile.skills = skills.map(s => ({ ...s, id: s.id || generateId() }));
    }
    if (projects !== undefined) {
      profile.projects = projects.map(p => ({ ...p, id: p.id || generateId() }));
    }
    if (certifications !== undefined) {
      profile.certifications = certifications.map(c => ({ ...c, id: c.id || generateId() }));
    }
    if (publications !== undefined) {
      profile.publications = publications.map(p => ({ ...p, id: p.id || generateId() }));
    }
    if (awards !== undefined) {
      profile.awards = awards.map(a => ({ ...a, id: a.id || generateId() }));
    }
    if (volunteer !== undefined) {
      profile.volunteer = volunteer.map(v => ({ ...v, id: v.id || generateId() }));
    }
    if (customSections !== undefined) {
      profile.customSections = customSections.map(c => ({ ...c, id: c.id || generateId() }));
    }
    if (targetProfiles !== undefined) profile.targetProfiles = targetProfiles;
    if (portfolioSettings !== undefined) profile.portfolioSettings = { ...profile.portfolioSettings, ...portfolioSettings };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Career Profile updated successfully.',
      profile
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/career-profile/verify-item
// @desc    Change verification status of an item or bullet
// @access  Private
router.put('/verify-item', auth, async (req, res, next) => {
  try {
    const { section, itemId, bulletId, status } = req.body;
    const validStatuses = ['VERIFIED', 'IMPORTED', 'SUGGESTED', 'UNSUPPORTED', 'NEEDS_REVIEW'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const profile = await CareerProfile.findOne({ userId: req.user.userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Career profile not found.' });

    if (section === 'experiences' && profile.experiences) {
      const exp = profile.experiences.find(e => e.id === itemId);
      if (exp) {
        if (bulletId && exp.bullets) {
          const bullet = exp.bullets.find(b => b.id === bulletId);
          if (bullet) bullet.status = status;
        } else {
          exp.status = status;
        }
      }
    } else if (profile[section]) {
      const item = profile[section].find(i => i.id === itemId);
      if (item) item.status = status;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Verification status updated.',
      profile
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/career-profile/import-text
// @desc    Parse raw text extracted from resume and map into profile as IMPORTED
// @access  Private
router.post('/import-text', auth, async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Resume text is required for import.' });
    }

    let profile = await CareerProfile.findOne({ userId: req.user.userId });
    if (!profile) profile = new CareerProfile({ userId: req.user.userId });

    // Rule-based heuristic extraction
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && !profile.personal.email) {
      profile.personal.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch && !profile.personal.phone) {
      profile.personal.phone = phoneMatch[0];
    }

    // Extract URLs
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    if (linkedinMatch && !profile.personal.linkedin) {
      profile.personal.linkedin = linkedinMatch[0];
    }
    const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
    if (githubMatch && !profile.personal.github) {
      profile.personal.github = githubMatch[0];
    }

    // Identify candidate skills from known dictionary
    const skillDictionary = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java', 'C++', 'C#',
      'HTML', 'HTML5', 'CSS', 'CSS3', 'SQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Docker',
      'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'REST API', 'GraphQL', 'Redux',
      'Tailwind CSS', 'Bootstrap', 'Jest', 'Mocha', 'Cypress', 'Linux', 'CI/CD', 'Agile', 'Scrum'
    ];

    const detectedSkills = [];
    const textLower = text.toLowerCase();
    skillDictionary.forEach(skill => {
      // Regex word boundary match
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        if (!profile.skills.some(s => s.name.toLowerCase() === skill.toLowerCase())) {
          detectedSkills.push({
            id: generateId(),
            name: skill,
            category: 'Technical',
            proficiency: 'Intermediate',
            verified: false,
            status: 'IMPORTED'
          });
        }
      }
    });

    if (detectedSkills.length > 0) {
      profile.skills.push(...detectedSkills);
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Extracted ${detectedSkills.length} skills and contact information. Please review and verify.`,
      detectedSkillsCount: detectedSkills.length,
      profile
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/career-profile/ai/analyze-project
// @desc    Analyze project from public GitHub repo, live URL, and/or manual context
// @access  Private
router.post('/ai/analyze-project', auth, aiLimiter, async (req, res, next) => {
  try {
    const {
      projectName,
      githubUrl,
      liveUrl,
      context,
      existingTechnologies,
      existingDescription
    } = req.body;

    const result = await analyzeProject({
      projectName,
      githubUrl,
      liveUrl,
      context,
      existingTechnologies,
      existingDescription
    });

    if (!result.success) {
      return res.status(result.isPrivateOrNotFound ? 404 : 400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/career-profile/ai/generate-project-description
// @desc    Generate 3 distinct truthful description variants for a project
// @access  Private
router.post('/ai/generate-project-description', auth, aiLimiter, async (req, res, next) => {
  try {
    const {
      projectName,
      technologies,
      context,
      existingDescription
    } = req.body;

    const result = await generateProjectDescription({
      projectName,
      technologies,
      context,
      existingDescription
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/career-profile/ai/suggest-skills
// @desc    Recommend skills strictly grounded in candidate's verified career evidence
// @access  Private
router.post('/ai/suggest-skills', auth, aiLimiter, async (req, res, next) => {
  try {
    let profileData = req.body.profileData;
    if (!profileData) {
      profileData = await CareerProfile.findOne({ userId: req.user.userId });
    }

    if (!profileData) {
      return res.status(404).json({ success: false, message: 'Career profile not found.' });
    }

    const result = await suggestSkillsFromProfile(profileData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
