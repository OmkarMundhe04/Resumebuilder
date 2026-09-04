const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// @route   GET /api/health
// @desc    Liveness health check
// @access  Public
router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    version: '2.0.0'
  });
});

// @route   GET /api/health/ready
// @desc    Readiness probe for deployment orchestrators
// @access  Public
router.get('/ready', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({ ready: true, message: 'Platform backend ready to receive traffic.' });
  }
  return res.status(503).json({ ready: false, message: 'Database connection not ready.' });
});

module.exports = router;
