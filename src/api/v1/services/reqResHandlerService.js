const http = require("http");
const httpStatus = require("http-status-codes");

const {SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS} = require("../../utils/constants");
const {RequestTimeoutError, RequestFailedError} = require("../../errors/errorClasses");
const logger = require('../../../../src/api/utils/logger');
const errorHandlerService = require('../services/errorHandlerService');

async function handleResponse(res) {
    if (res.statusCode !== httpStatus.OK) {
        throw new RequestFailedError(null, res.statusCode);
    }
    return res;
}

function makeRequest(requestUrl) {
    return new Promise((resolve, reject) => {
        const req = http.get(requestUrl.href, (res) => {
            try {
                const dataStream = handleResponse(res);
                resolve(dataStream);
            } catch (err) {
                reject(err);
            }
        });

        req.on('error', (err) => {
            logger.log(err.message, 'error');
            reject(new RequestFailedError(errorHandlerService.getErrorMessage(err.code)));
        });


        req.setTimeout(SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS, () => {
            req.destroy();
            reject(new RequestTimeoutError());
        });
    });
}

module.exports = {
    makeRequest
};
