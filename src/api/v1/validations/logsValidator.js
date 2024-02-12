const httpStatus = require('http-status-codes');

const {FILE_NAME_CANNOT_BE_EMPTY, PATH_NOT_ALLOWED_IN_FILE_NAME} = require('../../utils/errorMessages');

function validateRequest(req, res, next) {
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

module.exports = {
    validateRequest: validateRequest
};