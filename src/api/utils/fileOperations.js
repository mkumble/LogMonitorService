const fs = require('fs');
const logger = require('./logger');
const constants = require('./constants')

function readFile(filePath, callback) {
    fs.readFile(filePath, constants.ENCODING, (err, data) => {
        if (err) {
            logger.log(err, 'error');
            callback(err);
        } else {
            callback(null, data);
        }
    });
}

module.exports = {
    readFile: readFile
};
