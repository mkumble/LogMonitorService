const fs = require('fs');
const logger = require('./logger');
const constants = require('./constants')

function readFileInReverse(filePath, callback) {
    fs.readFile(filePath, constants.ENCODING, (err, data) => {
        if (err) {
            logger.log(err, 'error');
            callback(err);
        } else {
            //split the log events by new line and reverse them
            let reversedLogContent = data.split('\n').reverse().join('\n');
            callback(null, reversedLogContent);
        }
    });
}

module.exports = {
    readFileInReverse: readFileInReverse
};
