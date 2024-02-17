const {Transform} = require('stream');
const {CURRENT_SERVER_URL, UTF8_ENCODING} = require("../../utils/constants");

//Tranforms the logs to a Response format with fields: serverUrl, fileName and (Logs or Errors)
class SingleResponseStreamTransform extends Transform {
    constructor(fileName, serverUrl, responseType) {
        super({objectMode: true});
        this.fileName = fileName;
        this.serverUrl = serverUrl;
        this.responseType = responseType;
        if (!this.serverUrl) {
            this.serverUrl = CURRENT_SERVER_URL;
        }
        this.isFirstChunk = true;
    }

    _transform(chunk, encoding, callback) {
        if (this.isFirstChunk) {
            this.push(`{"serverUrl": "${this.serverUrl}",\n"fileName": "${this.fileName}",\n"${this.responseType}": [\n`);
            this.isFirstChunk = false;
        } else {
            // Add a comma to separate the logs
            this.push(',\n');
        }
        // Push only the chunk, which is a log entry
        this.push(JSON.stringify(chunk.toString(UTF8_ENCODING)));
        callback();
    }

    _flush(callback) {
        // Close the logs array and the JSON object

        if (!this.isFirstChunk) {
            this.push('\n]}\n');
        }
        else {
            this.push(`{"serverUrl": "${this.serverUrl}",\n"fileName": "${this.fileName}",\n"${this.responseType}": []}\n`);
        }
        callback();
    }
}

module.exports = SingleResponseStreamTransform;
