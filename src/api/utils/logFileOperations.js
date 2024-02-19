const fs = require('fs');

const logger = require('./logger');
const constants = require('./constants')
const LogsStreamTransform = require("../v1/transforms/LogsStreamTransform");
const FileReader = require("./FileReader");

//handles reading fileStream data in reverse, throws FileStream error if reading fails
function readFileInReverse(filePath, numEntries, keyword) {
    return new Promise((resolve, reject) => {
        let reverseFileSream;
        try {
            reverseFileSream = new FileReader(filePath, true, {encoding: constants.UTF8_ENCODING});
        } catch (err) {
            logger.log(err, err.message);
            reject(err);
            return;
        }

        const logStream = reverseFileSream.pipe(new LogsStreamTransform(numEntries, keyword, reverseFileSream));
        resolve(logStream);
    });
}

module.exports = {
    readFileInReverse
};
