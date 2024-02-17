const errorResponseModel = require("../../../../src/api/v1/models/errorResponseModel");
const {Readable} = require('stream');

// Separate function for error handling
function getResponse(fileName, error, serverUrl) {
   return errorResponseModel.getErrorResponse(fileName, error, serverUrl);
}

module.exports = {
    getResponse: getResponse
};