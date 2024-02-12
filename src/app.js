const express = require('express');
const app = express();
const constants = require('./api/utils/constants');

// API versioned routes
const apiRoutes = require('./api/v1');
app.use('/api/v1', apiRoutes);

app.listen(constants.SERVER_PORT, () => {
    console.log(`Server is running at ${constants.REQUEST_PROTOCOL}://${constants.SERVER_HOST_NAME}:${constants.SERVER_PORT}`);
});

module.exports = app;
