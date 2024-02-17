const path = require("path");
const url = require("url");
const Multistream = require('multistream');

const {LOG_FILES_BASE_PATH, CURRENT_SERVER_URL} = require("../../utils/constants");
const fileOperations = require("../../utils/fileOperations");
const {LOGS_API_ENDPOINT_V1} = require("../../utils/apiEndpoints");
const reqResHandlerService = require("./reqResHandlerService");
const SingleResponseStreamTransform = require("../transforms/SingleResponseStreamTransform");
const MultiResponseStreamTransform = require("../transforms/MulitResponseStreamTransform");
const errorHandlerService = require('../services/errorHandlerService');

async function getRemoteLogs(serverUrl, fileName, numEntries, keyword) {
    const requestUrl = new url.URL(LOGS_API_ENDPOINT_V1, serverUrl);
    requestUrl.searchParams.set('fileName', fileName);

    //setting params required to make request to secondary log servers
    if (numEntries !== undefined) {
        requestUrl.searchParams.set('numEntries', numEntries);
    }
    if (keyword !== undefined) {
        requestUrl.searchParams.set('keyword', keyword);
    }

    try {
        return await reqResHandlerService.makeRequest(requestUrl);
    } catch (err) {
        return errorHandlerService.getErrorStream(err).pipe(new SingleResponseStreamTransform(fileName, serverUrl, "error"));
    }
}

async function getLocalLogs(fileName, numEntries, keyword) {
    const filePath = path.join(LOG_FILES_BASE_PATH, fileName);

    try {
        const logsStream = await fileOperations.readFileInReverse(filePath, numEntries, keyword);
        return logsStream.pipe(new SingleResponseStreamTransform(fileName, null, "logs"));

    } catch (err) {
        return errorHandlerService.getErrorStream(err).pipe(new SingleResponseStreamTransform(fileName, null, "error"))
    }
}

/* go over every serverUrl in the request,
     if the url is local -> read local logs
    else make request to each of the secondary servers
*/
exports.getLogs = async ({serverUrls, fileName, numEntries, keyword}) => {
    let serverUrlsArray = serverUrls ? serverUrls.split(',') : [];

    // If no serverUrls, return local logs
    if (serverUrlsArray.length === 0) {
        return getLocalLogs(fileName, numEntries, keyword);
    }

    let uniqueServerUrls = Array.from(new Set(serverUrlsArray));
    const logStreamPromiseArray = uniqueServerUrls.map(async (url, index) => {
        let logStream;
        if (url === CURRENT_SERVER_URL) {
            logStream = await getLocalLogs(fileName, numEntries, keyword);
        } else {
            logStream = await getRemoteLogs(url, fileName, numEntries, keyword);
        }

        // format the logStream data using MultiResponseStreamTransform
        return logStream.pipe(new MultiResponseStreamTransform(index, uniqueServerUrls.length));

    });

    // combining all resolved promise array streams to a multistream
    return new Multistream(await Promise.all(logStreamPromiseArray));
};
