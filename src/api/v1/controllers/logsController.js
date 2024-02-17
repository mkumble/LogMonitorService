const logsService = require('../services/logsService');
const errorHandlerService = require('../services/errorHandlerService');

//controller handles marshalling/unmarshalling the request
exports.getLogsFromServers = async (req, res) => {
    try {
        //stream of multiple logs (each log from a server)
        const logsStream = await logsService.getLogs(req.query);
        logsStream.pipe(res);
    } catch (err) {
        errorResponse = errorHandlerService.getResponse(err);
        //responses from secondary servers have the http status set as part of the payload
        res.status(errorResponse.httpStatus).send(errorResponse);
    }
};
