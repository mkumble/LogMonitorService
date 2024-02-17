const httpStatus = require('http-status-codes');
const {
    FILE_DOES_NOT_EXIST,
    FILE_STREAM_CREATE_ERROR,
    REQUEST_TIMED_OUT
} = require("./errorMessages");

//Error classes for internal error handling
class BaseError extends Error {
    constructor(message, httpStatusCode) {
        super(message);
        this.httpStatus = httpStatusCode || httpStatus.INTERNAL_SERVER_ERROR;
    }

    toJSON() {
        return {
            message: this.message
        };
    }
}

class FileDoesNotExistError extends BaseError {
    constructor() {
        super(FILE_DOES_NOT_EXIST, httpStatus.NOT_FOUND);
    }
}

class FileStreamCreateError extends BaseError {
    constructor() {
        super(FILE_STREAM_CREATE_ERROR, httpStatus.INTERNAL_SERVER_ERROR);
    }
}

class RequestFailedError extends BaseError {
    constructor(message, httpStatusCode) {
        super(message, httpStatusCode);
    }
}

class RequestTimeoutError extends BaseError {
    constructor() {
        super(REQUEST_TIMED_OUT, httpStatus.REQUEST_TIMEOUT);
    }
}

class ValidationError extends BaseError {
    constructor(message) {
        super(message, httpStatus.BAD_REQUEST);
    }
}

module.exports = {
    FileDoesNotExistError,
    FileStreamCreateError,
    RequestFailedError,
    RequestTimeoutError,
    ValidationError
};

