//router for routing the requests to appropriate controller
const express = require('express');

const logsRouter = express.Router();
const logsValidator = require('../validations/logsValidator')

// Import logs controller
const logsController = require('../controllers/logsController');

// Route for retrieving local logs
logsRouter.get('/', logsValidator.validateFileName, logsValidator.validateNumEntries, logsValidator.validateServerUrls, logsController.getLogsFromServers);

module.exports = logsRouter;

