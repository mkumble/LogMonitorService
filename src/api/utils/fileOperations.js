const fs = require('fs');

const logger = require('./logger');
const constants = require('./constants')

function readFileInReverse(filePath, numEntries, keyword, callback) {
    fs.readFile(filePath, constants.ENCODING, (err, data) => {
        if (err) {
            logger.log(err, 'error');
            callback(err);
        } else {
            let lines = data.split('\n');
            //skipping the last line if it's empty
            if (lines[lines.length - 1] === '') {
                lines.pop();
            }
            // filtering lines by keyword before filtering by numEntries
            if (keyword) {
                lines = lines.filter(line => line.includes(keyword));
            }
            let reversedLogContent = lines.reverse().slice(0, numEntries).join('\n');
            callback(null, reversedLogContent);
        }
    });
}

module.exports = {
    readFileInReverse: readFileInReverse
};
