//module for storing the error messages
module.exports = {
    //file errors
    FILE_DOES_NOT_EXIST: 'File does not exist.',
    FILE_STREAM_CREATE_ERROR: 'File Stream Create Error.',
    FILE_NAME_CANNOT_BE_EMPTY: 'File name cannot be empty.',
    LOG_FILE_READ_ERROR: 'An error occurred while reading the log file.',

    //request errors
    HOST_ADDRESS_NOT_FOUND: "The requested host address is not found.",
    HOST_CONNECTION_RESET: "The connection was abruptly closed by the server.",
    HOST_UNREACHABLE: 'The host server cannot be reached.',
    INVALID_SECONDARY_SERVER_URL_HOST_NAME: 'Invalid Secondary Server URL host name',
    INVALID_SECONDARY_SERVER_URL_PORT: 'Invalid port for the Secondary Server URL',
    NUM_ENTRIES_MUST_BE_A_NUMBER: 'Number of Entries query param must be a number.',
    NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO: 'Number of Entries must be greater than 0.',
    REQUEST_FAILED: 'Request failed',
    REQUEST_TIMED_OUT: 'The request to the server timed out.',
    TARGET_SERVER_NOT_ACCEPTING_CONNECTIONS: 'The target server is not accepting connections.',
    PATH_NOT_ALLOWED_IN_FILE_NAME: 'Path not allowed in file name.',

    //response errors
    INTERNAL_SERVER_ERROR: 'Internal Server Error'
};
