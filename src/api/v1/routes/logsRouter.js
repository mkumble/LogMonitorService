//router for routing the requests to appropriate controller
const express = require('express');
const logsRouter = express.Router();

// Import logs controller
const logsController = require('../controllers/logsController');

// Route for retreiving local logs
logsRouter.get('/', logsController.getLocalLogs);

module.exports = logsRouter;
