const { Transform } = require('stream');

// transform the logs stream based on the input criteria
class LogsStreamTransform extends Transform {
    constructor(numEntries, keyword) {
        super({ objectMode: true });
        this.numEntries = numEntries;
        this.keyword = keyword;
        this.lines = [];
    }

    _transform(chunk, encoding, callback) {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
            // Remove trailing empty lines
            if (line.trim() === '') {
                continue;
            }

            if (this.keyword && !line.includes(this.keyword)) {
                continue;
            }
            this.lines.push(line);
            if (this.numEntries && this.lines.length > this.numEntries) {
                this.lines.shift();
            }
        }
        callback();
    }

    _flush(callback) {
        for (const line of this.lines.reverse()) {
            this.push(line);
        }
        callback();
    }
}

module.exports = LogsStreamTransform;