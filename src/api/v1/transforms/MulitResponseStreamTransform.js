const { Transform } = require('stream');

class MultiResponseStreamTransform extends Transform {
    constructor(index, total, options) {
        super(options);
        this.index = index;
        this.total = total;
        this.firstChunk = true;
    }

    _transform(chunk, encoding, callback) {
        if (this.index === 0 && this.firstChunk && this.total > 1) {
            this.push('[');
            this.firstChunk = false;
        }
        this.push(chunk);
        callback();
    }

    _flush(callback) {
        if (this.total > 1) {

            if(this.index === this.total - 1) {
                // If it's the last stream, append a closing bracket
                this.push(']');
            }
            else {
                this.push(',');
            }
        }
        callback();
    }
}

module.exports = MultiResponseStreamTransform;
