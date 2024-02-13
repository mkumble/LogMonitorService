const httpStatus = require('http-status-codes');
const {
    FileDoesNotExistError, FileStreamError, ReadLineInterfaceError, RequestTimeoutError
} = require("../../errors/errorClasses");
const logsService = require('../services/logsService');
const {FILE_DOESNT_EXIST, INTERNAL_SERVER_ERROR} = require("../../errors/errorMessages");

//controller handles marshalling/unmarshalling the request
exports.getLogsFromServers = async (req, res) => {
    try {
        const logs = await logsService.getLogs(req.query);
        return res.send(logs);
    } catch (err) {
        console.error(`Error occurred while fetching logs: ${err.message}. Request parameters: ${JSON.stringify(req.query)}`);
        if (err instanceof FileDoesNotExistError) {
            res.status(httpStatus.BAD_REQUEST).send(FILE_DOESNT_EXIST);
        } else if (err instanceof FileStreamError || err instanceof ReadLineInterfaceError || err instanceof RequestTimeoutError) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(INTERNAL_SERVER_ERROR);
        } else {
            res.send(err.message);
        }
    }
};
