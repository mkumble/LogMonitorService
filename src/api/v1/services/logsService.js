const httpStatus = require("http-status-codes");
const {REQUEST_TIMED_OUT} = require("../../errors/errorMessages");
const path = require("path");
const {
    LOG_FILES_BASE_PATH,
    SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS,
    PRIMARY_SERVER_URL
} = require("../../utils/constants");
const fileOperations = require("../../utils/fileOperations");
const url = require("url");
const {LOGS_API_ENDPOINT_V1} = require("../../utils/apiEndpoints");
const http = require("http");
const {RequestFailedError, ResponseError, RequestTimeoutError} = require('../../errors/errorClasses');

async function handleResponse(res) {
    return new Promise((resolve, reject) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            resolve(data);
        });
        res.on('error', (err) => {
            console.error(err);
            reject(new ResponseError(`Error receiving response: ${err.message}`));
        });
    });
}

async function getRemoteLogs(serverUrl, fileName, numEntries, keyword) {
    return new Promise((resolve, reject) => {
        const urlObj = new url.URL(LOGS_API_ENDPOINT_V1, serverUrl);
        urlObj.searchParams.set('fileName', fileName);
        if (numEntries !== undefined) {
            urlObj.searchParams.set('numEntries', numEntries);
        }
        if (keyword !== undefined) {
            urlObj.searchParams.set('keyword', keyword);
        }

        const req = http.get(urlObj.href, async (res) => {
            if (res.statusCode !== httpStatus.OK) {
                reject(new RequestFailedError(`Request failed with status code ${res.statusCode}`));
                return;
            }
            try {
                const data = await handleResponse(res);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }).on('error', (err) => {
            console.error(err);
            reject(new FileStreamError(`Error making request: ${err.message}`));
        });

        req.setTimeout(SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS, () => {
            req.destroy();
            reject(new RequestTimeoutError(REQUEST_TIMED_OUT));
        });
    });
}

async function getLocalLogs(fileName, numEntries, keyword) {
    const filePath = path.join(LOG_FILES_BASE_PATH, fileName);
    try {
        const result = await fileOperations.readFileInReverse(filePath, numEntries, keyword);
        return `Server ` + PRIMARY_SERVER_URL + `:\nLogs:\n${result}\n`;

    } catch (err) {
        return "Server " + PRIMARY_SERVER_URL + ":\nError:\n" + err.message + "\n";
    }
}

exports.getLogs = async ({serverUrls, fileName, numEntries, keyword}) => {
    let serverUrlsArray = serverUrls ? serverUrls.split(',') : [];

    //if no serverUrls, return local logs
    if (serverUrlsArray.length === 0) {
        serverUrlsArray[0] = PRIMARY_SERVER_URL;
    }

    const logPromises = serverUrlsArray.map(url => {
        if (url === PRIMARY_SERVER_URL) {
            return getLocalLogs(fileName, numEntries, keyword).catch(err => err);
        } else {
            return getRemoteLogs(url, fileName, numEntries, keyword).catch(err => err);
        }
    });

    return Promise.all(logPromises)
        .then(allLogs => allLogs.join('\n'))
        .catch(err => {
            console.error(`Unexpected error occurred: ${err.message}`);
            throw err;
        });
};
