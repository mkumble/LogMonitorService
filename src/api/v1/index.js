//module for routing requests to specific router
const express = require('express');
const router = express.Router();

// Import routes (we just have one route)
const logsRoutes = require('./routes/logsRouter');

// Use routes
router.use('/logs', logsRoutes);

module.exports = router;
