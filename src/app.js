const path = require("path");
const express = require('express');
const app = express();

const constants = require('./api/utils/constants');
// API versioned routes
const apiRoutes = require('./api/v1');
const logger = require('./api/utils/logger');

app.use('/api/v1', apiRoutes);

// Load UI (index.html)
app.use(express.static(path.join(__dirname, '../public')));

app.listen(constants.SERVER_PORT, () => {
    logger.log(`Server is running at ${constants.CURRENT_SERVER_URL}`, 'info');
});

module.exports = app;
