const httpStatus = require('http-status-codes');
const {
    FILE_DOES_NOT_EXIST,
    INTERNAL_SERVER_ERROR,
    REQUEST_TIMED_OUT,
    FILE_STREAM_READ_ERROR,
    FILE_STREAM_CREATE_ERROR
} = require("./errorMessages");

//Error classes for internal error handling
class FileDoesNotExistError extends Error {
    constructor() {
        super(FILE_DOES_NOT_EXIST);
        this.httpStatus = httpStatus.NOT_FOUND;
    }
}

class FileStreamReadError extends Error {
    constructor() {
        super(FILE_STREAM_READ_ERROR);
        this.httpStatus = httpStatus.INTERNAL_SERVER_ERROR;
    }
}

class FileStreamCreateError extends Error {
    constructor() {
        super(FILE_STREAM_CREATE_ERROR);
        this.httpStatus = httpStatus.INTERNAL_SERVER_ERROR;
    }
}

class ReadLineInterfaceError extends Error {
    constructor() {
        super(INTERNAL_SERVER_ERROR);
        this.httpStatus = httpStatus.INTERNAL_SERVER_ERROR;
    }
}

class RequestFailedError extends Error {
    constructor(message, httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }
}

class RequestTimeoutError extends Error {
    constructor() {
        super(REQUEST_TIMED_OUT);
        this.httpStatus = httpStatus.REQUEST_TIMEOUT;
    }
}

class ResponseDataParseError extends Error {
    constructor(message) {
        super(message);
    }
}

class ValidationError extends Error {
    constructor(message, httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }
}

module.exports = {
    FileDoesNotExistError,
    FileStreamCreateError,
    FileStreamReadError,
    ReadLineInterfaceError,
    ResponseDataParseError,
    RequestFailedError,
    RequestTimeoutError,
    ValidationError
};
