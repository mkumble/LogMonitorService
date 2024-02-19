const {Readable} = require('stream');
const fs = require("fs");

const {FileDoesNotExistError} = require("../errors/errorClasses");
const StopReadingEvent = require('../v1/events/StopReadingEvent');
const constants = require('./constants')

//Given a file path, returns each line from the file as a stream.
// Order of lines in the stream is configured by the reversedRead flag.
//Reads can be stopped by calling the stopReadingEvent on the stream.
class FileReader extends Readable {
    constructor(path, reversedRead, options) {
        if (!fs.existsSync(path)) {
            throw new FileDoesNotExistError();
        }

        super(options);
        //flag to specify the order of file read
        this.reversedRead = reversedRead;
        //open the file for reading
        this.fd = fs.openSync(path, 'r');
        //position keeps track of current read from the end of the file
        this.currentReadPosition = fs.statSync(path).size;

        //size of the buffer to read at each call
        this.bufferSize = constants.FILE_READ_BUFFER_SIZE;
        this.buffer = Buffer.alloc(this.bufferSize);

        this.stopReadingEvent = new StopReadingEvent();
        //capture the partialLine of the chunk
        this.partialLine = "";
        //lines that will be sent to Consumer during the next _read call
        this.linesToProcess = [];
    }

    //Updates the 'lines' input array with the lines read and returns the number of bytes read
    readLines(readPosition, readLengthBytes, lines) {
        // Read bytes and convert to string
        let bytesRead = fs.readSync(this.fd, this.buffer, 0, readLengthBytes, readPosition);
        let data = this.buffer.toString(constants.UTF8_ENCODING, 0, bytesRead);

        // Update the lines array
        Array.prototype.push.apply(lines, data.split('\n'));

        // Return the number of bytes read
        return bytesRead;
    }

    sendPartialLineAndCloseStream() {
        if (this.partialLine) {
            this.push(this.partialLine);
            this.partialLine = '';
        }
        this.push(null);
        fs.closeSync(this.fd);
    }

    _read() {
        //currently, we only require reversed reads
        if (!this.reversedRead) {
            return;
        }

        //send the partialLine to consumer and close the file stream when we reach the beginning of the file
        if (this.linesToProcess.length === 0 && this.currentReadPosition <= 0) {
            this.sendPartialLineAndCloseStream();
            return;
        }

        //read new data from file only when there are no lines left to process
        if (this.linesToProcess.length === 0) {
            let readLengthBytes;
            let readPosition;
            //if less file is left to read than the bufferSize,
            // read from beginning of file till the currentReadPosition
            if (this.currentReadPosition - this.bufferSize <= 0) {
                readLengthBytes = this.currentReadPosition;
                readPosition = 0;
            }
            //otherwise, read bufferSize bytes from the currentReadPosition
            else {
                readLengthBytes = this.bufferSize;
                readPosition = this.currentReadPosition - this.bufferSize;
            }
            //read the readLengthBytes from the readPosition
            const bytesRead = this.readLines(readPosition, readLengthBytes, this.linesToProcess);

            //update currentReadPosition after byte reads
            this.currentReadPosition -= bytesRead;

            //append any partial lines from previous iteration
            this.linesToProcess[this.linesToProcess.length - 1] += this.partialLine;

            //update partial line for current iteration
            this.partialLine = this.linesToProcess.shift();

            if (this.linesToProcess.length === 0 && this.currentReadPosition <= 0) {
                this.sendPartialLineAndCloseStream();
                return;
            }
        }

        while (this.linesToProcess.length > 0) {
            let line = this.linesToProcess.pop();

            if (!this.push(line)) {
                // If push returns false,
                // stop pushing and wait for the next _read call
                return;
            }
        }
    }

    //consumer calls this method to tell the producer to stop reading from the file stream
    stopReading() {
        //setting the currentReadPosition to start of file to stop reading
        this.currentReadPosition = 0;
    }
}

module.exports = FileReader;
