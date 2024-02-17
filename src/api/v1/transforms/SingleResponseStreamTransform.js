const {Transform} = require('stream');
const httpStatus = require('http-status-codes');

const {CURRENT_SERVER_URL, UTF8_ENCODING} = require("../../utils/constants");

//Tranforms the logs to a Response format with fields: serverUrl, fileName and (Logs or Errors)
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
            this.push(`{"serverUrl": "${this.serverUrl}",\n"fileName": "${this.fileName}",\n"httpStatus": ${this.httpStatus},\n"${this.responseType}": [\n${JSON.stringify(data)}`);
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
            this.push(`{"serverUrl": "${this.serverUrl}",\n"fileName": "${this.fileName}",\n"httpStatus": "${this.httpStatus}",\n"${this.responseType}": []}\n`);
        }
        callback();
    }
}


module.exports = SingleResponseStreamTransform;
