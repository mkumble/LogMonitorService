const fs = require('fs');
const readline = require('readline');
const logger = require('./logger');
const constants = require('./constants')
const {FileDoesNotExistError, FileStreamReadError} = require('../errors/errorClasses');
const {FILE_STREAM_READ_ERROR, FILE_STREAM_CREATE_ERROR} = require("../errors/errorMessages");

//handles reading fileStream data, throws FileStream error if reading fails
async function handleFileStream(fileStream) {
    return new Promise((resolve, reject) => {
        let lines = [];
        const readLineInterface = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        readLineInterface.on('line', (line) => {
            lines.push(line);
        });

        readLineInterface.on('close', () => {
            resolve(lines);
        });

        readLineInterface.on('error', (err) => {
            logger.log(err, FILE_STREAM_READ_ERROR);
            reject(new FileStreamReadError());
        });
    });
}

//public function for reading file in reverse (uses fileStream)
function readFileInReverse(filePath, numEntries, keyword) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(new FileDoesNotExistError());
            return;
        }

        let fileStream;
        try {
            fileStream = fs.createReadStream(filePath, {encoding: constants.ENCODING});
        } catch (err) {
            logger.log(err, FILE_STREAM_CREATE_ERROR);
            reject(new FileStreamReadError());
            return;
        }

        handleFileStream(fileStream)
            .then(lines => {

                // Remove trailing empty lines
                while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
                    lines.pop();
                }

                if (keyword) {
                    lines = lines.filter(line => line.includes(keyword));
                }
                if (numEntries) {
                    lines = lines.slice(-numEntries);
                }
                const jsonLines = lines.reverse().map((line, index) => ({line: index + 1, content: line}));
                resolve(jsonLines);
            })
            .catch(err => reject(err));
    });
}

module.exports = {
    readFileInReverse
};
