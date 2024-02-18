const logsService = require('../services/logsService');
const errorHandlerService = require('../services/errorHandlerService');
const {CONTENT_TYPE_APPLICATION_JSON} = require('../../utils/constants');

//controller handles marshalling/unmarshalling the request
exports.getLogsFromServers = async (req, res) => {
    res.setHeader('Content-Type', CONTENT_TYPE_APPLICATION_JSON);
    try {
        //stream of multiple logs (each log from a server)
        const logsStream = await logsService.getLogs(req.query);
        logsStream.pipe(res);
    } catch (err) {
        errorResponse = errorHandlerService.getResponse(err);
        //responses from secondary servers have the http status set as part of the payload
        res.status(errorResponse.httpStatusCode).send(errorResponse);
    }
};
