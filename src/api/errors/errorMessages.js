//module for storing the error messages
module.exports = {
    //file errors
    FILE_DOES_NOT_EXIST: 'File does not exist.',
    FILE_STREAM_CREATE_ERROR: 'File Stream Create Error.',
    FILE_STREAM_READ_ERROR: 'File Stream Read Error.',
    FILE_NAME_CANNOT_BE_EMPTY: 'File name cannot be empty.',
    LOG_FILE_READ_ERROR: 'An error occurred while reading the log file.',

    //request errors
    INVALID_SERVER_URL: 'Invalid Server URL',
    NUM_ENTRIES_MUST_BE_A_NUMBER: 'Number of Entries query param must be a number.',
    NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO: 'Number of Entries must be greater than 0.',
    REQUEST_TIMED_OUT: 'Request timed out',
    PATH_NOT_ALLOWED_IN_FILE_NAME: 'Path not allowed in file name.',

    //response errors
    INTERNAL_SERVER_ERROR: 'Internal Server Error'
};
