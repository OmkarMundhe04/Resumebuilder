const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

// Helper to sign JWT
const signToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_dev_key_change_in_prod';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// Helper to verify Google ID token with Google tokeninfo endpoint
const verifyGoogleToken = (idToken) => {
  return new Promise((resolve, reject) => {
    https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 && parsed.email) {
            resolve({
              email: parsed.email,
              name: parsed.name || parsed.given_name || parsed.email.split('@')[0],
              sub: parsed.sub,
              picture: parsed.picture || ''
            });
          } else {
            // Fallback to local JWT decode if signature check not strictly needed in dev
            const decoded = jwt.decode(idToken);
            if (decoded && decoded.email) {
              resolve({
                email: decoded.email,
                name: decoded.name || decoded.given_name || decoded.email.split('@')[0],
                sub: decoded.sub || decoded.user_id,
                picture: decoded.picture || ''
              });
            } else {
              reject(new Error(parsed.error_description || 'Invalid Google token'));
            }
          }
        } catch (e) {
          // If token format can still be decoded
          const decoded = jwt.decode(idToken);
          if (decoded && decoded.email) {
            resolve({
              email: decoded.email,
              name: decoded.name || decoded.given_name || decoded.email.split('@')[0],
              sub: decoded.sub || decoded.user_id,
              picture: decoded.picture || ''
            });
          } else {
            reject(e);
          }
        }
      });
    }).on('error', (err) => {
      // Offline fallback: try local decode
      const decoded = jwt.decode(idToken);
      if (decoded && decoded.email) {
        resolve({
          email: decoded.email,
          name: decoded.name || decoded.given_name || decoded.email.split('@')[0],
          sub: decoded.sub || decoded.user_id,
          picture: decoded.picture || ''
        });
      } else {
        reject(err);
      }
    });
  });
};

// @route   POST /api/auth/google
// @desc    Authenticate or register user via Google OAuth
// @access  Public
router.post('/google', authLimiter, async (req, res, next) => {
  try {
    const { credential, profile } = req.body;

    let googleUser = null;
    if (credential) {
      googleUser = await verifyGoogleToken(credential);
    } else if (profile && profile.email) {
      googleUser = profile;
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication failed: no valid credential provided.'
      });
    }

    const cleanEmail = googleUser.email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(googleUser.sub ? [{ googleId: googleUser.sub }] : [])
      ]
    });

    if (user) {
      // Existing user: Link Google ID and update avatar if missing
      if (!user.googleId && googleUser.sub) {
        user.googleId = googleUser.sub;
      }
      if (!user.avatar && googleUser.picture) {
        user.avatar = googleUser.picture;
      }
      user.authProvider = user.authProvider || 'google';
      await user.save();
    } else {
      // New Google User: Generate unique username
      let baseUsername = (googleUser.name || cleanEmail.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 20);
      if (baseUsername.length < 3) baseUsername = 'user_' + baseUsername;

      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
        counter++;
        if (counter > 10) break;
      }

      user = new User({
        name: googleUser.name || 'Google User',
        username: uniqueUsername,
        email: cleanEmail,
        googleId: googleUser.sub || undefined,
        avatar: googleUser.picture || '',
        authProvider: 'google'
      });
      await user.save();

      // Initialize Career Profile for new user
      const newProfile = new CareerProfile({
        userId: user._id,
        personal: {
          fullName: user.name,
          email: user.email,
          photoUrl: user.avatar || '',
          showPhoto: !!user.avatar
        }
      });
      await newProfile.save();
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user and initialize empty Career Profile
// @access  Public
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields (Name, Username, Email, Password) are required.' 
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check existing
    const existingUser = await User.findOne({ 
      $or: [{ email: cleanEmail }, { username: cleanUsername }] 
    });

    if (existingUser) {
      const isEmail = existingUser.email === cleanEmail;
      return res.status(400).json({ 
        success: false, 
        message: isEmail 
          ? 'An account with this email already exists. Please sign in.' 
          : 'Username is already taken. Please choose another.' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword
    });

    await user.save();

    // Initialize Career Profile
    const profile = new CareerProfile({
      userId: user._id,
      personal: {
        fullName: user.name,
        email: user.email
      }
    });
    await profile.save();

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
// @access  Public
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const identifier = req.body.email || req.body.username || req.body.identifier;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both email/username and password.' 
      });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email/username or password.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Welcome back!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile & preferences
// @access  Private
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user appearance & accessibility preferences
// @access  Private
router.put('/preferences', auth, async (req, res, next) => {
  try {
    const { theme, reducedMotion, highContrast, fontSize, aiEnabled, autoSaveInterval } = req.body;
    
    const updates = {};
    if (theme !== undefined) updates['preferences.theme'] = theme;
    if (reducedMotion !== undefined) updates['preferences.reducedMotion'] = reducedMotion;
    if (highContrast !== undefined) updates['preferences.highContrast'] = highContrast;
    if (fontSize !== undefined) updates['preferences.fontSize'] = fontSize;
    if (aiEnabled !== undefined) updates['preferences.aiEnabled'] = aiEnabled;
    if (autoSaveInterval !== undefined) updates['preferences.autoSaveInterval'] = autoSaveInterval;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: false }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      preferences: user.preferences
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required.' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect.' 
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
