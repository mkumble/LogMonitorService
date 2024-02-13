const httpStatus = require('http-status-codes');

const {FILE_NAME_CANNOT_BE_EMPTY, PATH_NOT_ALLOWED_IN_FILE_NAME, NUM_ENTRIES_MUST_BE_A_NUMBER, NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO} = require('../../utils/errorMessages');

//validates the log file name query param
function validateFileName(req, res, next) {
    const fileName = req.query.fileName;

    if (!fileName) {
        return res.status(httpStatus.BAD_REQUEST).send(FILE_NAME_CANNOT_BE_EMPTY);
    }

    // validate filename for invalid/malicious paths
    if(fileName.includes('/') || fileName.includes('..')) {
        return res.status(httpStatus.BAD_REQUEST).send(PATH_NOT_ALLOWED_IN_FILE_NAME);
    }

    next();
}

//validates the numEntries query param
function validateNumEntries(req, res, next) {
    let numEntries = req.query.numEntries;

    // If numEntries is not present, skip validation
    if (!numEntries) {
        return next();
    }

    numEntries = Number(numEntries);

    if (isNaN(numEntries)) {
        return res.status(httpStatus.BAD_REQUEST).send(NUM_ENTRIES_MUST_BE_A_NUMBER);
    }

    if (numEntries < 1) {
        return res.status(httpStatus.BAD_REQUEST).send(NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO);
    }

    next();
}


module.exports = {
    validateFileName,
    validateNumEntries
};
