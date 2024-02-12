const http = require('http');
const httpStatus = require('http-status-codes');
const url = require('url');
const path = require('path');

const fileOperations = require('../../utils/fileOperations');
const {LOG_FILE_READ_ERROR} = require('../../utils/errorMessages');
const {
    LOG_FILES_BASE_PATH,
    REQUEST_PROTOCOL,
    SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS,
    SERVER_HOST_NAME,
    SERVER_PORT
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
            const urlObj = new url.URL(serverUrl);
            urlObj.searchParams.set('fileName', fileName);
            urlObj.searchParams.set('numEntries', numEntries);
            urlObj.searchParams.set('keyword', keyword);

            http.get(urlObj.href, (res) => {
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
        });
    }

    const logPromises = serverUrls.map(url => {
        if (url === primaryServerUrl) {
            return getLocalLogs(fileName, numEntries, keyword);
        } else {
            return getRemoteLogs(url, fileName, numEntries, keyword);
        }
    });

    try {
        const allLogs = await Promise.allSettled(logPromises);
        const logs = allLogs.map((promise, server) => {
            //server response format
            if (promise.status === 'fulfilled') {
                return `Server ${serverUrls[server]}:\nLogs:\n${promise.value}\n`;
            } else {
                return `Server ${serverUrls[server]}:\n${promise.reason}\n`;
            }
        });
        const combinedLogs = logs.join('\n');
        res.send(combinedLogs);
    } catch (err) {
        console.error(err);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(LOG_FILE_READ_ERROR);
    }

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

