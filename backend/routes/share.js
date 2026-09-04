const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ShareLink = require('../models/ShareLink');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { publicShareLimiter } = require('../middleware/security');

const router = express.Router();

// @route   POST /api/share/create
// @desc    Generate or retrieve an active share link for a resume
// @access  Private
router.post('/create', auth, async (req, res, next) => {
  try {
    const { resumeId, title, password, expiresDays = 30, maskContactInfo = false, allowDownload = true } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.userId });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    let passwordHash = null;
    let isPasswordProtected = false;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
      isPasswordProtected = true;
    }

    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);
    const token = crypto.randomBytes(24).toString('hex');

    const shareLink = new ShareLink({
      token,
      resumeId: resume._id,
      userId: req.user.userId,
      title: title || `${resume.title} (Public Link)`,
      passwordHash,
      isPasswordProtected,
      expiresAt,
      maskContactInfo,
      allowDownload,
      isActive: true
    });

    await shareLink.save();

    res.status(201).json({
      success: true,
      token: shareLink.token,
      message: 'Share link generated successfully.',
      shareLink: {
        token: shareLink.token,
        title: shareLink.title,
        expiresAt: shareLink.expiresAt,
        isPasswordProtected: shareLink.isPasswordProtected,
        maskContactInfo: shareLink.maskContactInfo,
        allowDownload: shareLink.allowDownload,
        viewCount: shareLink.viewCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/share/my-links/:resumeId
// @desc    Get active share links for a resume
// @access  Private
router.get('/my-links/:resumeId', auth, async (req, res, next) => {
  try {
    const links = await ShareLink.find({
      resumeId: req.params.resumeId,
      userId: req.user.userId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      links
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/share/revoke/:token
// @desc    Revoke a share link
// @access  Private
router.delete('/revoke/:token', auth, async (req, res, next) => {
  try {
    const link = await ShareLink.findOne({ token: req.params.token, userId: req.user.userId });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Share link not found.' });
    }

    link.isActive = false;
    await link.save();

    res.status(200).json({
      success: true,
      message: 'Share link revoked. It can no longer be viewed.'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/share/view/:token
// @desc    Public view endpoint for a shared resume
// @access  Public
router.get('/view/:token', publicShareLimiter, async (req, res, next) => {
  try {
    const link = await ShareLink.findOne({ token: req.params.token, isActive: true });

    if (!link) {
      return res.status(404).json({ success: false, message: 'This shared resume link is invalid or has been revoked.' });
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).json({ success: false, message: 'This shared resume link has expired.' });
    }

    // Check if password protected
    if (link.isPasswordProtected) {
      return res.status(200).json({
        success: true,
        isPasswordProtected: true,
        title: link.title,
        message: 'This resume is password-protected. Please provide the access password.'
      });
    }

    const resume = await Resume.findById(link.resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Underlying resume was removed.' });
    }

    // Increment view count
    link.viewCount += 1;
    link.lastViewedAt = new Date();
    await link.save();

    const resumeData = resume.toObject();

    // Mask contact info if requested
    if (link.maskContactInfo) {
      if (resumeData.personal) {
        resumeData.personal.phone = '• • • • • • • •';
        resumeData.personal.email = resumeData.personal.email ? resumeData.personal.email.replace(/(.).+(@.+)/, '$1***$2') : '';
        resumeData.personal.location = resumeData.personal.location ? resumeData.personal.location.split(',').pop()?.trim() : '';
      }
    }

    res.status(200).json({
      success: true,
      isPasswordProtected: false,
      allowDownload: link.allowDownload,
      shareConfig: {
        maskContactInfo: link.maskContactInfo,
        allowDownload: link.allowDownload
      },
      resume: resumeData
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/share/view/:token/auth
// @desc    Authenticate password-protected shared resume
// @access  Public
router.post('/view/:token/auth', publicShareLimiter, async (req, res, next) => {
  try {
    const { password } = req.body;
    const link = await ShareLink.findOne({ token: req.params.token, isActive: true });

    if (!link) {
      return res.status(404).json({ success: false, message: 'Link invalid or revoked.' });
    }

    if (!password || !link.passwordHash) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const isMatch = await bcrypt.compare(password, link.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect access password.' });
    }

    const resume = await Resume.findById(link.resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Underlying resume not found.' });
    }

    link.viewCount += 1;
    link.lastViewedAt = new Date();
    await link.save();

    const resumeData = resume.toObject();
    if (link.maskContactInfo && resumeData.personal) {
      resumeData.personal.phone = '• • • • • • • •';
      resumeData.personal.email = resumeData.personal.email ? resumeData.personal.email.replace(/(.).+(@.+)/, '$1***$2') : '';
    }

    res.status(200).json({
      success: true,
      allowDownload: link.allowDownload,
      resume: resumeData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
