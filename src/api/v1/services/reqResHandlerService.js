const http = require("http");
const httpStatus = require("http-status-codes");

const {CURRENT_SERVER_URL, SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS} = require("../../utils/constants");
const {RequestTimeoutError, RequestFailedError, ResponseDataParseError} = require("../../errors/errorClasses");
const logger = require('../../../../src/api/utils/logger');

async function handleResponse(res) {
    return new Promise((resolve, reject) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            try {
                //serialize the logs data to json
                const jsonData = JSON.parse(data);
                //secondary server sends an array of length 1, we just need the first entry
                resolve(jsonData[0]);
            } catch (err) {
                logger.log(err.message, 'error');
                reject(new ResponseDataParseError(err.message));
            }
        });
    });
}

function makeRequest(requestUrl) {
    return new Promise((resolve, reject) => {
        const req = http.get(requestUrl.href, async (res) => {
            if (res.statusCode !== httpStatus.OK) {
                reject(new RequestFailedError(null, res.statusCode));
                return;
            }
            try {
                const data = await handleResponse(res);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        });

        req.on('error', (err) => {
            logger.log(err.message, 'error');
            reject(new RequestFailedError(err.message));
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
