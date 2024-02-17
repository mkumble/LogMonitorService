const httpStatus = require("http-status-codes");
const {CURRENT_SERVER_URL} = require("../../utils/constants");

/*
Build a response payload with
- server
- httpStatus
- fileName
- logs or error message
for each serverUrl request
 */
function getResponse(fileName, logs, error, serverUrl) {
    let responseMessage = {
        serverUrl: CURRENT_SERVER_URL,
        httpStatus: httpStatus.OK
    };

    if (serverUrl) {
        responseMessage.serverUrl = serverUrl;
    }

    if (fileName) {
        responseMessage.fileName = fileName;
    }

    if (logs) {
        responseMessage.logs = logs;
    }

    if (error) {
        responseMessage.error = error.message;
        responseMessage.httpStatus = error.httpStatus;
    }

    return responseMessage;
}

module.exports = {
    getResponse
};