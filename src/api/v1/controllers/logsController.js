// controller that handles all the log API V1 endpoints
const httpStatus = require('http-status-codes');
const path = require('path');

const fileOperations = require('../../utils/fileOperations');
const {LOG_FILE_READ_ERROR} = require('../../utils/errorMessages');
const {LOG_FILES_BASE_PATH} = require("../../utils/constants");

exports.getLocalLogs = async (req, res) => {
    const fileName = req.query.fileName;
    const filePath = path.join(LOG_FILES_BASE_PATH, fileName);
    const numEntries = req.query.numEntries;
    const keyword = req.query.keyword;

    try {
        const data = await fileOperations.readFileInReverse(filePath, numEntries, keyword);
        res.send(data);
    } catch (err) {
        console.error(err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(LOG_FILE_READ_ERROR);
    }
};
