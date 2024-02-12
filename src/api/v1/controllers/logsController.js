// controller that handles all the log API V1 endpoints
const httpStatus = require('http-status-codes');
const fileOperations = require('../../utils/fileOperations');
const constants = require('../../utils/constants');
const {LOG_FILE_READ_ERROR} = require('../../utils/errorMessages');

exports.getLocalLogs = (req, res) => {
    fileOperations.readFile(constants.LOG_FILE, (err, data) => {
        if (err) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(LOG_FILE_READ_ERROR);
        }
        res.send(data);
    });
};
