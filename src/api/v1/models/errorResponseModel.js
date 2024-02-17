let httpStatus = require("http-status-codes");
const {CURRENT_SERVER_URL} = require("../../utils/constants");

/*
Build a response payload with
- server
- httpStatus
- fileName
- logs or error message
for each serverUrl request
 */
function getErrorResponse(fileName, error, serverUrl) {
    let errorResponse = {};

    errorResponse.serverUrl = CURRENT_SERVER_URL || serverUrl;

    if (fileName) {
        errorResponse.fileName = fileName;
    }

    errorResponse.httpStatus = error.httpStatus;
    errorResponse.errors = [];
    errorResponse.errors.push(error.message);

    return errorResponse;
}

module.exports = {
    getErrorResponse: getErrorResponse
};