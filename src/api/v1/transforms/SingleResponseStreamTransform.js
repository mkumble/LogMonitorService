const {Transform} = require('stream');
const httpStatus = require('http-status-codes');

const {CURRENT_SERVER_URL, UTF8_ENCODING} = require("../../utils/constants");

//Creates a payload format for a log response
function createPayload(serverUrl, fileName, httpStatusCode, responseType, data) {
    return `{"serverUrl": "${serverUrl}",\n"fileName": "${fileName}",\n"httpStatusCode": ${httpStatusCode},\n"${responseType}": [\n${JSON.stringify(data)}`;
}

//Tranforms the logs to a Response format with fields: serverUrl, fileName and (Logs or Errors)
class SingleResponseStreamTransform extends Transform {
    constructor(fileName, serverUrl, responseType, httpStatusCode) {
        super({objectMode: true});
        this.fileName = fileName;
        this.serverUrl = serverUrl || CURRENT_SERVER_URL;
        this.responseType = responseType;
        this.httpStatusCode = httpStatusCode || httpStatus.OK;
        this.isFirstChunk = true;
    }

    _transform(chunk, encoding, callback) {
        let data = chunk.toString(UTF8_ENCODING);
        if (this.isFirstChunk) {
            this.push(createPayload(this.serverUrl, this.fileName, this.httpStatusCode, this.responseType, data));
            this.isFirstChunk = false;
        } else {
            // Adding a comma and newline to separate the logs
            this.push(`,\n${JSON.stringify(data)}`);
        }
        callback();
    }

    _flush(callback) {
        if (!this.isFirstChunk) {
            //end of the logs json array
            this.push('\n]}\n');
        } else {
            this.push(createPayload(this.serverUrl, this.fileName, this.httpStatusCode, this.responseType, []));
        }
        callback();
    }
}

module.exports = SingleResponseStreamTransform;
