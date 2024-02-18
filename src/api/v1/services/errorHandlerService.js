const errorResponseModel = require("../../../../src/api/v1/models/errorResponseModel");
const {Readable} = require('stream');
const {
    HOST_ADDRESS_NOT_FOUND,
    HOST_CONNECTION_RESET,
    HOST_UNREACHABLE,
    REQUEST_FAILED,
    REQUEST_TIMED_OUT,
    TARGET_SERVER_NOT_ACCEPTING_CONNECTIONS
} = require("../../errors/errorMessages");

// Separate function for error handling
function getResponse(fileName, error, serverUrl) {
    return errorResponseModel.getErrorResponse(fileName, error, serverUrl);
}

function getErrorStream(error) {
    return new Readable({
        read() {
            this.push(error.message);
            this.push(null); // No more data
        }
    });
}

function getErrorMessage(errCode) {
    switch (errCode) {
        case 'ECONNREFUSED':
            return TARGET_SERVER_NOT_ACCEPTING_CONNECTIONS;
        case 'ETIMEDOUT':
            return REQUEST_TIMED_OUT;

        case 'EHOSTUNREACH':
            return HOST_UNREACHABLE;

        case 'ENOTFOUND':
            return HOST_ADDRESS_NOT_FOUND;

        case 'ECONNRESET':
            return HOST_CONNECTION_RESET;

        default:
            return REQUEST_FAILED;
    }
}

module.exports = {
    getResponse: getResponse,
    getErrorStream: getErrorStream,
    getErrorMessage: getErrorMessage
};
