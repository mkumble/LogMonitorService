const {Transform} = require('stream');

// transform the logs stream based on the input criteria
class LogsStreamTransform extends Transform {
    constructor(numEntries, keyword, readStream) {
        super({objectMode: true});
        this.numEntries = numEntries;
        this.keyword = keyword;
        this.lineCount = 0;
        this.readStream = readStream;
    }

    _transform(chunk, encoding, callback) {
        let line = chunk.toString();
        if (this.keyword && !line.includes(this.keyword)) {
            callback();
            return;
        }
        if (this.numEntries && this.lineCount >= this.numEntries) {
            this.readStream.stopReading();
            callback();
            return;
        }
        this.lineCount++;
        this.push(line);
        callback();
    }
}

module.exports = LogsStreamTransform;
