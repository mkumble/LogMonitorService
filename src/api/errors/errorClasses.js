//Error classes for internal error handling
class FileDoesNotExistError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileDoesNotExistError';
    }
}

class FileStreamError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileStreamError';
    }
}

class ReadLineInterfaceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ReadLineInterfaceError';
    }
}

class RequestTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RequestTimeoutError';
    }
}

module.exports = {
    FileDoesNotExistError,
    FileStreamError,
    ReadLineInterfaceError,
    RequestTimeoutError
};
