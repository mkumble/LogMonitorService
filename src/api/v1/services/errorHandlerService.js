const errorResponseModel = require("../../../../src/api/v1/models/errorResponseModel");
const {Readable} = require('stream');
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

module.exports = {
    getResponse: getResponse,
    getErrorStream: getErrorStream
};
