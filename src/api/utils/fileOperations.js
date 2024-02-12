const fs = require('fs');
const readline = require('readline');
const logger = require('./logger');
const constants = require('./constants')
const errorMessages = require('./errorMessages')

function readFileInReverse(filePath, numEntries, keyword) {
    return new Promise((resolve, reject) => {
        // Check if file exists before creating read stream
        if (!fs.existsSync(filePath)) {
            resolve(errorMessages.FILE_DOESNT_EXIST);
            return;
        }

        let fileStream;
        try {
            fileStream = fs.createReadStream(filePath, { encoding: constants.ENCODING });
        } catch (err) {
            logger.log(err, 'error');
            reject(err);
        }
        const readLineInterface = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lines = [];
        readLineInterface.on('line', (line) => {
            // if keyword is present, storing only the lines that contain the keyword in memory
            if (!keyword || line.includes(keyword)) {
                lines.push(line);
                //we don't need greater than numEntries lines in memory
                if (lines.length > numEntries) {
                    lines.shift();  // remove the first line (oldest event)
                }
            }
        });

        readLineInterface.on('close', () => {
            const reversedLogContent = lines.reverse().join('\n');
            resolve(reversedLogContent);
        });

        readLineInterface.on('error', (err) => {
            logger.log(err, 'error');
            reject(err);
        });
    });
}

module.exports = {
    readFileInReverse: readFileInReverse
};
