const httpStatus = require('http-status-codes');
const url = require('url')

const {
    FILE_NAME_CANNOT_BE_EMPTY,
    INVALID_SERVER_URL,
    PATH_NOT_ALLOWED_IN_FILE_NAME,
    NUM_ENTRIES_MUST_BE_A_NUMBER,
    NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO
} = require('../../errors/errorMessages');
const errorHandlerService = require('../services/errorHandlerService');
const {
    ValidationError
} = require("../../errors/errorClasses");

//validates the log file name query param
function validateFileName(req, res, next) {
    const fileName = req.query.fileName;

    if (!fileName) {
        let responseMessage = errorHandlerService.getResponse(null, new ValidationError(FILE_NAME_CANNOT_BE_EMPTY, httpStatus.NOT_FOUND));
        return res.status(httpStatus.BAD_REQUEST).send(responseMessage);
    }

    // validate filename for invalid/malicious paths
    if (fileName.includes('/') || fileName.includes('..')) {
        let responseMessage = errorHandlerService.getResponse(fileName, new ValidationError(PATH_NOT_ALLOWED_IN_FILE_NAME, httpStatus.BAD_REQUEST));
        return res.status(httpStatus.BAD_REQUEST).send(responseMessage);
    }

    next();
}

//validates the numEntries query param
function validateNumEntries(req, res, next) {
    let numEntries = req.query.numEntries;
    let fileName = req.query.fileName;

    // If numEntries is not present, skip validation
    if (!numEntries) {
        return next();
    }

    numEntries = Number(numEntries);

    if (isNaN(numEntries)) {
        let responseMessage = errorHandlerService.getResponse(fileName, new ValidationError(NUM_ENTRIES_MUST_BE_A_NUMBER, httpStatus.BAD_REQUEST));
        return res.status(httpStatus.BAD_REQUEST).send(responseMessage);
    }

    if (numEntries < 1) {
        let responseMessage = errorHandlerService.getResponse(fileName, new ValidationError(NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO, httpStatus.BAD_REQUEST));
        return res.status(httpStatus.BAD_REQUEST).send(responseMessage);
    }

    next();
}


function validateServerUrls(req, res, next) {
    let serverUrls = req.query.serverUrls;
    let fileName = req.query.fileName;

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
            let responseMessage = errorHandlerService.getResponse(fileName, new ValidationError(INVALID_SERVER_URL + ":" + serverUrl, httpStatus.BAD_REQUEST));
            return res.status(httpStatus.BAD_REQUEST).send(responseMessage);
        }
    }

    next();
}

module.exports = {
    validateFileName,
    validateNumEntries,
    validateServerUrls
};
