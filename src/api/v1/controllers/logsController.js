const http = require('http');
const httpStatus = require('http-status-codes');
const url = require('url');
const path = require('path');

const fileOperations = require('../../utils/fileOperations');
const {LOG_FILE_READ_ERROR, REQUEST_TIMED_OUT} = require('../../utils/errorMessages');
const {LOGS_API_ENDPOINT_V1} = require('../../utils/apiEndpoints');
const {
    LOG_FILES_BASE_PATH, REQUEST_PROTOCOL, SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS, SERVER_HOST_NAME, SERVER_PORT
} = require("../../utils/constants");
const primaryServerUrl = REQUEST_PROTOCOL + "://" + SERVER_HOST_NAME + ":" + SERVER_PORT;

exports.getLogsFromServers = async (req, res) => {
    let serverUrls = req.query.serverUrls ? req.query.serverUrls.split(',') : [];
    const fileName = req.query.fileName;
    const numEntries = req.query.numEntries;
    const keyword = req.query.keyword;

    // If serverUrls is empty, get logs from the local server only
    if (serverUrls.length === 0) {
        try {
            const logs = await getLocalLogs(fileName, numEntries, keyword);
            return res.send(logs);
        } catch (err) {
            console.error(err);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(LOG_FILE_READ_ERROR);
        }
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

            const req = http.get(urlObj.href, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(data);
                });

            }).on('error', (err) => {
                console.error(err);
                reject(new Error(LOG_FILE_READ_ERROR));
            });

            // Set a timeout for the request
            req.setTimeout(SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS, () => {
                req.destroy();
                reject(new Error(REQUEST_TIMED_OUT));
            });
        });
    }

    const logPromises = serverUrls.map(url => {
        if (url === primaryServerUrl) {
            return getLocalLogs(fileName, numEntries, keyword).catch(err => err);
        } else {
            return getRemoteLogs(url, fileName, numEntries, keyword).catch(err => err);
        }
    });

    Promise.all(logPromises).then(allLogs => {
        const logs = allLogs.map((result, server) => {
            if (result instanceof Error) {
                return `Server ${serverUrls[server]}:\n${result.message}\n`;
            } else {
                return `Server ${serverUrls[server]}:\nLogs:\n${result}\n`;
            }
        });
        const combinedLogs = logs.join('\n');
        res.send(combinedLogs);
    }).catch(err => {
        console.error(err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(LOG_FILE_READ_ERROR);
    });

    async function getLocalLogs(fileName, numEntries, keyword) {
        const filePath = path.join(LOG_FILES_BASE_PATH, fileName);
        try {
            return await fileOperations.readFileInReverse(filePath, numEntries, keyword);
        } catch (err) {
            console.error(err);
            throw new Error(LOG_FILE_READ_ERROR);
        }
    }
};

