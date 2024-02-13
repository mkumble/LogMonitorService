const fs = require('fs');
const readline = require('readline');
const logger = require('./logger');
const constants = require('./constants')
const errorMessages = require('../errors/errorMessages')

const { FileDoesNotExistError, FileStreamError } = require('../errors/errorClasses');

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
            logger.log(err, 'error');
            reject(new FileStreamError(err.message));
        });
    });
}

//public function for reading file in reverse (uses fileStream)
function readFileInReverse(filePath, numEntries, keyword) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(new FileDoesNotExistError(errorMessages.FILE_DOESNT_EXIST));
            return;
        }

        let fileStream;
        try {
            fileStream = fs.createReadStream(filePath, { encoding: constants.ENCODING });
        } catch (err) {
            logger.log(err, 'error');
            reject(new FileStreamError(err.message));
            return;
        }

        handleFileStream(fileStream)
            .then(lines => {
                if (keyword) {
                    lines = lines.filter(line => line.includes(keyword));
                }
                if (numEntries) {
                    lines = lines.slice(-numEntries);
                }
                resolve(lines.reverse().join('\n'));
            })
            .catch(err => reject(err));
    });
}

module.exports = {
    readFileInReverse
};
