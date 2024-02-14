const httpStatus = require('http-status-codes');
const logsService = require('../services/logsService');
const {INTERNAL_SERVER_ERROR} = require("../../errors/errorMessages");
const responseModel = require("../../../../src/api/v1/models/responseModel");

//controller handles marshalling/unmarshalling the request
exports.getLogsFromServers = async (req, res) => {
    try {
        const response = await logsService.getLogs(req.query);
        return res.json(response);
    } catch (err) {
        //responses from secondary servers have the http status set as part of the payload
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(responseModel.getResponse(httpStatus.INTERNAL_SERVER_ERROR, req.query.fileName, null, INTERNAL_SERVER_ERROR));
    }
};
