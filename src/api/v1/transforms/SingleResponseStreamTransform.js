const {Transform} = require('stream');
const httpStatus = require('http-status-codes');

const {CURRENT_SERVER_URL, UTF8_ENCODING} = require("../../utils/constants");

//Tranforms the logs to a Response format with fields: serverUrl, fileName and (Logs or Errors)
function createPayload(serverUrl, fileName, httpStatus, responseType, data) {
    return `{"serverUrl": "${serverUrl}",\n"fileName": "${fileName}",\n"httpStatus": ${httpStatus},\n"${responseType}": [\n${JSON.stringify(data)}`;
}

class SingleResponseStreamTransform extends Transform {
    constructor(fileName, serverUrl, responseType, httpStatusCode) {
        super({objectMode: true});
        this.fileName = fileName;
        this.serverUrl = serverUrl || CURRENT_SERVER_URL;
        this.responseType = responseType;
        this.httpStatus = httpStatusCode || httpStatus.OK;
        this.isFirstChunk = true;
    }

    _transform(chunk, encoding, callback) {
        let data = chunk.toString(UTF8_ENCODING);
        if (this.isFirstChunk) {
            this.push(createPayload(this.serverUrl, this.fileName, this.httpStatus, this.responseType, data));
            this.isFirstChunk = false;
        } else {
            this.push(`,\n${JSON.stringify(data)}`);
        }
        callback();
    }

    _flush(callback) {
        if (!this.isFirstChunk) {
            this.push('\n]}\n');
        } else {
            this.push(createPayload(this.serverUrl, this.fileName, this.httpStatus, this.responseType, []));
        }
        callback();
    }
}

module.exports = SingleResponseStreamTransform;
