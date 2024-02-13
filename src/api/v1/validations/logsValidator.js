const httpStatus = require('http-status-codes');
const url = require('url')

const {FILE_NAME_CANNOT_BE_EMPTY, INVALID_SERVER_URL, PATH_NOT_ALLOWED_IN_FILE_NAME, NUM_ENTRIES_MUST_BE_A_NUMBER, NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO} = require('../../errors/errorMessages');

//validates the log file name query param
function validateFileName(req, res, next) {
    const fileName = req.query.fileName;

    if (!fileName) {
        return res.status(httpStatus.BAD_REQUEST).send(FILE_NAME_CANNOT_BE_EMPTY);
    }

    // validate filename for invalid/malicious paths
    if (fileName.includes('/') || fileName.includes('..')) {
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


function validateServerUrls(req, res, next) {
    let serverUrls = req.query.serverUrls;

    // If serverUrls is not present, skip validation
    if (!serverUrls) {
        return next();
    }

    // if type is string, convert to array
    if (typeof serverUrls === 'string') {
        serverUrls = serverUrls.split(',');
    }

    for (let serverUrl of serverUrls) {
        try {
            new url.URL(serverUrl);
        } catch (err) {
            // If error is thrown, then the URL is not valid
            return res.status(httpStatus.BAD_REQUEST).send({error: INVALID_SERVER_URL + ":" + serverUrl});
        }
    }

    next();
}

module.exports = {
    validateFileName,
    validateNumEntries,
    validateServerUrls
};
