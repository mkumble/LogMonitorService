const httpStatus = require("http-status-codes");
const {CURRENT_SERVER_URL} = require("../../utils/constants");

/*
Build a response payload with
- server
- httpStatusCode
- fileName
- logs or error message
for each serverUrl request
 */
function getErrorResponse(fileName, error, serverUrl) {
    let errorResponse = {
        serverUrl: CURRENT_SERVER_URL,
        httpStatusCode: httpStatus.INTERNAL_SERVER_ERROR
    };

    if (serverUrl) {
        errorResponse.serverUrl = serverUrl;
    }

    if (fileName) {
        errorResponse.fileName = fileName;
    }

    if (error) {
        errorResponse.error = error.message;
        errorResponse.httpStatusCode = error.httpStatusCode;
    }

    return errorResponse;
}

module.exports = {
    getErrorResponse: getErrorResponse
};