const rateLimit = require('express-rate-limit');

// Authentication Rate Limiter (Brute-force protection: 100 req / 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: "Too many authentication attempts from this IP. Please try again in 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// AI & Heavy Processing Rate Limiter (20 req / min)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "AI assistance request limit reached. Please wait a moment before trying again."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public Share View Rate Limiter (60 req / min)
const publicShareLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: "Too many requests to this shared link. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API Rate Limiter (150 req / min)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  message: {
    success: false,
    message: "Too many API requests. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Simple input sanitizer middleware
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeValue = (val) => {
      if (typeof val === 'string') {
        // Strip potential script injections while preserving valid markdown/characters
        return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
      if (Array.isArray(val)) {
        return val.map(sanitizeValue);
      }
      if (val !== null && typeof val === 'object') {
        const cleaned = {};
        for (const [k, v] of Object.entries(val)) {
          cleaned[k] = sanitizeValue(v);
        }
        return cleaned;
      }
      return val;
    };
    req.body = sanitizeValue(req.body);
  }
  next();
};

module.exports = {
  authLimiter,
  aiLimiter,
  publicShareLimiter,
  apiLimiter,
  sanitizeInput
};
