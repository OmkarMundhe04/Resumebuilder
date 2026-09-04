require("dotenv").config();
const validateEnv = require('./utils/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Middleware
const { apiLimiter, sanitizeInput } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const careerProfileRoutes = require('./routes/careerProfile');
const resumeRoutes = require('./routes/resume');
const jobMatchRoutes = require('./routes/jobMatch');
const aiRoutes = require('./routes/aiAssistant');
const applicationRoutes = require('./routes/application');
const coverLetterRoutes = require('./routes/coverLetter');
const shareRoutes = require('./routes/share');
const privacyRoutes = require('./routes/privacy');

const app = express();

// Trust reverse proxies in production
app.set('trust proxy', 1);

// Security Headers via Helmet (with safe CSP)
app.use(helmet({
  contentSecurityPolicy: false, // Allows cross-origin asset loading for previews in dev/prod
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl) or allowed origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Access from this origin is restricted.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers & Sanitizer
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// General Rate Limiter
app.use('/api/', apiLimiter);

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resumebuilder';
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully to 'resumebuilder' database"))
  .catch((error) => console.error("❌ MongoDB connection error:", error.message));

// API Endpoints
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/career-profile', careerProfileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/job-match', jobMatchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/privacy', privacyRoutes);

// Catch-all 404 for unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found.` });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Career Document Platform Backend running on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful Shutdown Handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app;
