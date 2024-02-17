const fs = require('fs');

const logger = require('./logger');
const constants = require('./constants')
const {FileDoesNotExistError, FileStreamCreateError} = require('../errors/errorClasses');
const {FILE_STREAM_CREATE_ERROR} = require("../errors/errorMessages");
const LogsTransform = require("../v1/transforms/LogsStreamTransform");

//handles reading fileStream data, throws FileStream error if reading fails
function readFileInReverse(filePath, numEntries, keyword) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(new FileDoesNotExistError());
            return;
        }

        let fileStream;
        try {
            fileStream = fs.createReadStream(filePath, {encoding: constants.UTF8_ENCODING});
        } catch (err) {
            logger.log(err, FILE_STREAM_CREATE_ERROR);
            reject(new FileStreamCreateError());
            return;
        }

        const logStream = fileStream.pipe(new LogsTransform(numEntries, keyword));
        resolve(logStream);
    });
}

module.exports = {
    readFileInReverse
};
