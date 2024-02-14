const path = require("path");
const url = require("url");

const {LOG_FILES_BASE_PATH, CURRENT_SERVER_URL} = require("../../utils/constants");
const fileOperations = require("../../utils/fileOperations");
const {LOGS_API_ENDPOINT_V1} = require("../../utils/apiEndpoints");
const reqResHandlerService = require("./reqResHandlerService");
const responseModel = require("../models/responseModel");

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
        let response = await reqResHandlerService.makeRequest(requestUrl);
        //transforming the private ip of secondary server to public ip
        response.server = serverUrl;
        return response;
    } catch (err) {
        return responseModel.getResponse(fileName, null, err, serverUrl);
    }
}

async function getLocalLogs(fileName, numEntries, keyword) {
    const filePath = path.join(LOG_FILES_BASE_PATH, fileName);

    try {
        const logs = await fileOperations.readFileInReverse(filePath, numEntries, keyword);
        return responseModel.getResponse(fileName, logs, null);

    } catch (err) {
        return responseModel.getResponse(fileName, null, err);
    }
}

/* go over every serverUrl in the request,
     if the url is local -> read local logs
    else make request to each of the secondary servers
*/
exports.getLogs = async ({serverUrls, fileName, numEntries, keyword}) => {
    let serverUrlsArray = serverUrls ? serverUrls.split(',') : [];

    //if no serverUrls, return local logs
    if (serverUrlsArray.length === 0) {
        serverUrlsArray[0] = CURRENT_SERVER_URL;
    }

    let uniqueServerUrls = new Set(serverUrlsArray);
    const logPromises = Array.from(uniqueServerUrls).map(url => {
        if (url === CURRENT_SERVER_URL) {
            return getLocalLogs(fileName, numEntries, keyword).catch(err => err);
        } else {
            return getRemoteLogs(url, fileName, numEntries, keyword).catch(err => err);
        }
    });

    return Promise.all(logPromises)
        .then(allLogs => allLogs);
};
