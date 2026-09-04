const express = require('express');
const crypto = require('crypto');
const Resume = require('../models/Resume');
const CareerProfile = require('../models/CareerProfile');
const auth = require('../middleware/auth');

const router = express.Router();

const generateId = () => crypto.randomBytes(8).toString('hex');

// Calculate deterministic Resume Health metrics
const calculateHealth = (resume) => {
  let parserSafety = 100;
  let jobAlignment = 80;
  let evidenceStrength = 85;
  let readability = 95;
  let accessibility = 95;
  let completeness = 90;
  let formattingSafety = 100;

  const { personal, experiences, education, skills, projects } = resume;

  // Contact checks
  if (!personal?.email) { parserSafety -= 20; completeness -= 15; }
  if (!personal?.phone) { parserSafety -= 15; completeness -= 10; }
  if (!personal?.fullName) { parserSafety -= 25; completeness -= 20; }
  if (!personal?.summary || personal.summary.length < 30) { completeness -= 10; }

  // Experience checks
  if (!experiences || experiences.length === 0) {
    completeness -= 25;
    evidenceStrength -= 30;
  } else {
    let hasOutcomes = false;
    experiences.forEach(exp => {
      if (!exp.bullets || exp.bullets.length === 0) {
        evidenceStrength -= 15;
      } else {
        exp.bullets.forEach(b => {
          if (b.evidence?.outcome || b.evidence?.metric) hasOutcomes = true;
        });
      }
    });
    if (!hasOutcomes) evidenceStrength -= 20;
  }

  // Education checks
  if (!education || education.length === 0) completeness -= 15;

  // Skills checks
  if (!skills || skills.length === 0) {
    completeness -= 20;
    jobAlignment -= 25;
  } else if (skills.length < 5) {
    jobAlignment -= 10;
  }

  // Bound scores between 30 and 100
  const clamp = (val) => Math.max(30, Math.min(100, Math.round(val)));

  const pSafe = clamp(parserSafety);
  const jAlign = clamp(jobAlignment);
  const eStr = clamp(evidenceStrength);
  const rRead = clamp(readability);
  const aAcc = clamp(accessibility);
  const cComp = clamp(completeness);
  const fSafe = clamp(formattingSafety);
  const overall = Math.round((pSafe + jAlign + eStr + rRead + aAcc + cComp + fSafe) / 7);

  return {
    parserSafety: pSafe,
    jobAlignment: jAlign,
    evidenceStrength: eStr,
    readability: rRead,
    accessibility: aAcc,
    completeness: cComp,
    formattingSafety: fSafe,
    overall
  };
};

// @route   GET /api/resume
// @desc    Get all active resumes for logged-in user
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    const { includeArchived } = req.query;
    const filter = { userId: req.user.userId };
    if (!includeArchived) {
      filter.isArchived = false;
    }

    const resumes = await Resume.find(filter).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/resume/:id
// @desc    Get single resume with ownership verification
// @access  Private
router.get('/:id', auth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or you do not have permission to view it.'
      });
    }

    res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/resume
// @desc    Create new resume (optionally populated from Career Profile)
// @access  Private
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, targetRole, targetCompany, template, fromProfile } = req.body;

    let resumeData = {
      userId: req.user.userId,
      title: title?.trim() || 'Software Engineer Resume',
      targetRole: targetRole?.trim() || '',
      targetCompany: targetCompany?.trim() || '',
      template: template || 'ats-classic',
      version: 1,
      isDraft: req.body.isDraft !== undefined ? Boolean(req.body.isDraft) : false
    };

    const profile = await CareerProfile.findOne({ userId: req.user.userId });
    
    // Check if selected template has photo support by default
    const photoReadyTemplates = ['modern-professional', 'creative', 'silicon-valley', 'berlin-modern', 'corporate-navy', 'emerald-compact'];
    const isPhotoTemplate = photoReadyTemplates.includes(template || 'ats-classic');

    const defaultPersonal = {
      fullName: profile?.personal?.fullName || req.user.name || 'Candidate Name',
      title: profile?.personal?.title || targetRole?.trim() || 'Software Engineer',
      email: profile?.personal?.email || req.user.email || 'user@example.com',
      phone: profile?.personal?.phone || '',
      location: profile?.personal?.location || '',
      website: profile?.personal?.website || '',
      linkedin: profile?.personal?.linkedin || '',
      github: profile?.personal?.github || '',
      portfolio: profile?.personal?.portfolio || '',
      summary: profile?.personal?.summary || 'Dedicated professional with a proven track record of architecting scalable applications and collaborating cross-functionally.',
      showPhoto: profile?.personal?.showPhoto !== undefined ? profile.personal.showPhoto : isPhotoTemplate,
      photoUrl: profile?.personal?.photoUrl || profile?.personal?.avatar || req.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(req.user.name || 'User')}`
    };

    resumeData.personal = req.body.personal ? { ...defaultPersonal, ...req.body.personal } : defaultPersonal;
    resumeData.experiences = (req.body.experiences && req.body.experiences.length > 0)
      ? req.body.experiences
      : ((profile?.experiences && profile.experiences.length > 0) ? profile.experiences : [{
          id: generateId(),
          company: 'Tech Innovations Inc',
          role: 'Full Stack Engineer',
          location: 'Remote',
          startDate: '2022',
          endDate: 'Present',
          isCurrent: true,
          bullets: [{
            id: generateId(),
            text: 'Architected and deployed responsive web applications using React, Node.js, and cloud infrastructure.',
            evidence: { role: 'Developer', task: 'Web Development', technology: 'React, Node.js', outcome: 'Improved reliability and reduced latency' },
            status: 'VERIFIED'
          }]
        }]);

    resumeData.education = (req.body.education && req.body.education.length > 0)
      ? req.body.education
      : ((profile?.education && profile.education.length > 0) ? profile.education : [{
          id: generateId(),
          institution: 'University of Technology',
          degree: 'Bachelor of Science in Computer Science',
          startDate: '2018',
          endDate: '2022'
        }]);

    resumeData.skills = (req.body.skills && req.body.skills.length > 0)
      ? req.body.skills.map(s => ({
          id: s.id || generateId(),
          name: s.name || '',
          note: s.note !== undefined ? s.note : (s.proficiency || '')
        }))
      : ((profile?.skills && profile.skills.length > 0) ? profile.skills.map(s => ({
          id: s.id || generateId(),
          name: s.name || '',
          note: s.note !== undefined ? s.note : (s.proficiency || '')
        })) : [
          { id: generateId(), name: 'JavaScript', note: '' },
          { id: generateId(), name: 'React', note: '' },
          { id: generateId(), name: 'Node.js', note: '' },
          { id: generateId(), name: 'TypeScript', note: '' },
          { id: generateId(), name: 'REST APIs', note: '' }
        ]);

    resumeData.projects = (req.body.projects && req.body.projects.length > 0)
      ? req.body.projects
      : ((profile?.projects && profile.projects.length > 0) ? profile.projects : [{
          id: generateId(),
          name: 'Career Document Platform',
          description: 'A full-stack career platform with ATS validation and live preview.',
          technologies: ['React', 'Node.js', 'MongoDB'],
          link: '',
          bullets: [{ id: generateId(), text: 'Designed and built full-stack architecture with 99% ATS parsing accuracy.' }]
        }]);

    resumeData.certifications = req.body.certifications !== undefined ? req.body.certifications : (profile?.certifications || []);
    resumeData.publications = req.body.publications !== undefined ? req.body.publications : (profile?.publications || []);
    resumeData.awards = req.body.awards !== undefined ? req.body.awards : (profile?.awards || []);
    resumeData.volunteer = req.body.volunteer !== undefined ? req.body.volunteer : (profile?.volunteer || []);
    resumeData.customSections = req.body.customSections !== undefined ? req.body.customSections : [];
    if (req.body.sectionOrder) resumeData.sectionOrder = req.body.sectionOrder;
    if (req.body.sectionVisibility) resumeData.sectionVisibility = req.body.sectionVisibility;
    if (req.body.formatting) resumeData.formatting = req.body.formatting;

    resumeData.health = calculateHealth(resumeData);

    const resume = new Resume(resumeData);
    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume created successfully.',
      resume
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/resume/:id
// @desc    Update an existing resume
// @access  Private
router.put('/:id', auth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or you do not have permission to edit it.'
      });
    }

    const updatableFields = [
      'title', 'targetRole', 'targetCompany', 'template', 'personal',
      'sectionOrder', 'sectionVisibility', 'experiences', 'education',
      'skills', 'projects', 'certifications', 'publications', 'awards',
      'volunteer', 'customSections', 'formatting', 'jobDescription', 'tags',
      'isDraft', 'isArchived'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        resume[field] = req.body[field];
      }
    });

    // Recalculate health
    resume.health = calculateHealth(resume);

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume saved.',
      resume
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/resume/:id/duplicate
// @desc    Duplicate an existing resume as a new version
// @access  Private
router.post('/:id/duplicate', auth, async (req, res, next) => {
  try {
    const original = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original resume not found.' });
    }

    const copyObj = original.toObject();
    delete copyObj._id;
    delete copyObj.createdAt;
    delete copyObj.updatedAt;

    copyObj.title = `${original.title} (Copy)`;
    copyObj.parentResumeId = original._id;
    copyObj.version = (original.version || 1) + 1;

    const newResume = new Resume(copyObj);
    await newResume.save();

    res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully.',
      resume: newResume
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/resume/:id/tailor
// @desc    Create a tailored resume version linked to a specific job
// @access  Private
router.post('/:id/tailor', auth, async (req, res, next) => {
  try {
    const { targetRole, targetCompany, jobDescription, matchedSkills, missingSkills } = req.body;

    const baseResume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!baseResume) {
      return res.status(404).json({ success: false, message: 'Base resume not found.' });
    }

    const tailoredData = baseResume.toObject();
    delete tailoredData._id;
    delete tailoredData.createdAt;
    delete tailoredData.updatedAt;

    tailoredData.title = `${targetRole || baseResume.targetRole || 'Tailored Role'} — ${targetCompany || 'Target Company'}`;
    tailoredData.targetRole = targetRole || baseResume.targetRole;
    tailoredData.targetCompany = targetCompany || baseResume.targetCompany;
    tailoredData.parentResumeId = baseResume._id;
    tailoredData.version = (baseResume.version || 1) + 1;
    tailoredData.jobDescription = {
      rawText: jobDescription || '',
      matchedSkills: matchedSkills || [],
      missingSkills: missingSkills || [],
      matchScore: matchedSkills?.length ? Math.min(100, Math.round((matchedSkills.length / ((matchedSkills.length + (missingSkills?.length || 0)) || 1)) * 100)) : 80
    };

    tailoredData.health = calculateHealth(tailoredData);

    const tailoredResume = new Resume(tailoredData);
    await tailoredResume.save();

    res.status(201).json({
      success: true,
      message: `Tailored version created for ${targetCompany || 'target role'}.`,
      resume: tailoredResume
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/resume/:id
// @desc    Delete or Archive a resume
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { permanent } = req.query;

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    if (permanent === 'true') {
      await Resume.deleteOne({ _id: req.params.id });
      return res.status(200).json({ success: true, message: 'Resume permanently deleted.' });
    }

    resume.isArchived = true;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume moved to archive.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
