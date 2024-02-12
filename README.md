# Log Monitor Service
This service provides on-demand monitoring of various Unix-based servers without having to log into each individual machine and opening up the log files found in /var/log.

## Requirements, Design & Architecture:
Detailed information about the requirements, design, and architecture of this service can be found here: https://docs.google.com/document/d/13GyRpE5BllY1iMDoQd9ffszhTRFUfHQzeOUxAGgiXe4/edit?usp=sharing

## Implementation
1. logsRouter: Accepts the HTTP GET requests for the logs API Endpoints and directs to the logsValidator.
2. logsValidator: Validates the fileName and numEntries in the input request and directs to the logsController
2. logsController Ingress: Invokes the fileOperations module for the request.
3. fileOperations: Reads the stream of log data asynchronously from the local server for the given criteria and returns to logsController. 
3. logsController Egress: Return the data as text/html in the HTTP Response.

## Installation
Follow these steps to install the service:
1. Make sure npm is installed on the host.
2. Clone the repo: `git clone https://github.com/mkumble/LogMonitorService.git`
3. Install dependencies: ```cd LogMonitorService; npm install```

## Configuration
Modify the default configurations defined in `LogMonitorService/src/api/utils/constants.js` as needed (Example: change SERVER_PORT)

## Running the service
1. Follow the Installation instructions above.
2. Open the terminal and navigate to the src directory: `cd LogMonitorService/src`
3. Start the node.js application: `node app.js`. By default, the server runs on `http://localhost:3000`

## UI
After running the service, UI can be accessed on `http://localhost:3000/index.html`
![Log Monitor UI Phase1](./images/LogMonitorUI_Phase1.png)
![Log Monitor UI Phase2](./images/LogMonitorUI_Phase2.png)

## Running unit tests
1. Make sure the server is not running on localhost 3000.
2. Run `npm test` to run all the unit tests

## Commiting Changes
1. Commits follow the conventional commit specification https://www.conventionalcommits.org/en/v1.0.0/#specification
2. API design is based on OpenAPI specification https://swagger.io/specification/

## APIs
#### Pre-requisite: Please follow the 'Running the service' instructions above.

### (GET) Log file lookup
```
GET /api/v1/logs
```
Retrieve a log file from local server.

**Parameters:**

| Name       | Type   | Mandatory | Description                                                                        |
|------------|--------|-----------|------------------------------------------------------------------------------------|
| fileName   | STRING | YES       | A valid fileName (in /var/logs) on the local server.                               |
| numEntries | NUMBER | NO        | Number of log lines/entries to retrieve.                                           |
| keyword    | STRING | NO        | An encoded string to search in the log file                                        |
| serverUrls | STRING | NO        | Comma separated list of server URLs. These servers must be running the application |

**Data Source:**
Filesystem

**Response:**

Happy Path:
Input | Status | Status Code | Output/Error Message
------------ | ------------ | ------------ | ------------
Valid fileName | Success | 200 | Complete logs of the file (latest to old).
Valid fileName, Valid numEntries | Success | 200 | Most Recent 'numEntries' lines of the file.
Valid fileName, Valid numEntries, Valid (URL encoded) keyword | Success | 200 | Most recent 'numEntries' lines of the file containing the keyword/text.
Valid fileName, Valid numEntries, Valid (URL encoded) keyword, Valid serverURLs | Success | 200 | Most recent 'numEntries' lines of the file containing the keyword/text for each serverURL
Valid fileName, Valid numEntries, Valid (URL encoded) keyword, Partially reachable/valid serverURLs | Success | 200 | Combination of success and error messages based on the response for each serverURL.


Errors:
Input | Status | Status Code | Output/Error Message
------------ | ------------ | ------------ | ------------
Missing fileName | Error | 400 | File name cannot be empty.
FileName containing path | Error | 400 | Path not allowed in file name.
File doesn't exist in /var/log | Error | 500 | An error occurred while reading the log file.
numEntries < 1 | Error | 400 | Number of Entries must be greater than 0.
numEntries is NaN | Error | 400 | Number of Entries query param must be a number.
All serverURLs are unreachable/invalid | Error | 500 | Server <Server>: Error: An error occurred while reading the log file.

### Sample Requests/Response

#### Get all logs from a log file
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log"
```
##### Response
```
Feb 11 20:38:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 11 20:37:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 11 20:36:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
```

#### Get last 3 entries from a log file
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log&numEntries=3"
```
##### Response
```
Feb 11 20:41:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 11 20:40:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 11 20:39:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
```

#### Get last 5 entries containing the keyword from a log file
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log&numEntries=5&keyword=Function:%20loadXML"
```
##### Response
```
Feb 11 20:43:06 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 11 20:42:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 11 20:41:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 11 20:40:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 11 20:39:05 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
```

#### Get last 5 entries containing the keyword from a log file for two serverURLs (both are valid)
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log&numEntries=5&keyword=System&serverUrls=http://localhost:3000,http://192.168.0.122:3000"
```
##### Response
```
Server http://localhost:3000:
Logs:
Feb 12 02:27:10 MacBook-Pro csc_iseagentd[1124]: Function: sendUIStatus Thread Id: 0xE1ED5000 File: SwiftManager.cpp Line: 186 Level: debug :: MSG_SU_STEP_STATUS, {Status:6,Compliant:3,RemStatus:1803564464,Phase:0,StepNumber:-1,Progress:-1,Attention:0,Cancellable:0,Restartable:0,ErrorMessage:1,Description1:"System scan not required on current Wi-Fi.",Description2:""}
Feb 12 02:27:10 MacBook-Pro csc_iseagentd[1124]: Function: getIpAndMacList Thread Id: 0xE1ED5000 File: SystemInfo.cpp Line: 131 Level: debug :: MAC List=86:13:9A:27:06:81,86:13:9A:27:06:7F,86:13:9A:27:06:5F,86:13:9A:27:06:60,86:13:9A:27:06:61,36:AC:CE:97:8A:40,36:AC:CE:97:8A:44,36:AC:CE:97:8A:48,36:AC:CE:97:8A:40,6E:7E:67:BB:53:F0,6C:7E:67:BB:53:F0,6C:7E:67:BB:53:F0,9A:B1:B4:B7:17:01,9A:B1:B4:B7:17:01,86:13:9A:27:06:80,86:13:9A:27:06:80,86:13:9A:27:06:80,86:13:9A:27:06:80, IP List=0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,fe80::6c7e:67ff:febb:53f0,192.168.0.237,fe80::1d:f393:b9d5:e0dc,fe80::98b1:b4ff:feb7:1701,fe80::98b1:b4ff:feb7:1701,fe80::ac5d:1d91:a3f5:8bff,fe80::f55:e405:d6fd:736d,fe80::591d:f393:752d:ef1e,fe80::ce81:b1c:bd2c:69e, saved MAC=86:13:9A:27:06:80
Feb 12 01:57:10 MacBook-Pro csc_iseagentd[1124]: Function: sendUIStatus Thread Id: 0xE1ED5000 File: SwiftManager.cpp Line: 186 Level: debug :: MSG_SU_STEP_STATUS, {Status:6,Compliant:3,RemStatus:1803564464,Phase:0,StepNumber:-1,Progress:-1,Attention:0,Cancellable:0,Restartable:0,ErrorMessage:1,Description1:"System scan not required on current Wi-Fi.",Description2:""}
Feb 12 01:57:10 MacBook-Pro csc_iseagentd[1124]: Function: getIpAndMacList Thread Id: 0xE1ED5000 File: SystemInfo.cpp Line: 131 Level: debug :: MAC List=86:13:9A:27:06:81,86:13:9A:27:06:7F,86:13:9A:27:06:5F,86:13:9A:27:06:60,86:13:9A:27:06:61,36:AC:CE:97:8A:40,36:AC:CE:97:8A:44,36:AC:CE:97:8A:48,36:AC:CE:97:8A:40,6E:7E:67:BB:53:F0,6C:7E:67:BB:53:F0,6C:7E:67:BB:53:F0,9A:B1:B4:B7:17:01,9A:B1:B4:B7:17:01,86:13:9A:27:06:80,86:13:9A:27:06:80,86:13:9A:27:06:80,86:13:9A:27:06:80, IP List=0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,fe80::6c7e:67ff:febb:53f0,192.168.0.237,fe80::1d:f393:b9d5:e0dc,fe80::98b1:b4ff:feb7:1701,fe80::98b1:b4ff:feb7:1701,fe80::ac5d:1d91:a3f5:8bff,fe80::f55:e405:d6fd:736d,fe80::591d:f393:752d:ef1e,fe80::ce81:b1c:bd2c:69e, saved MAC=86:13:9A:27:06:80
Feb 12 01:27:10 MacBook-Pro csc_iseagentd[1124]: Function: sendUIStatus Thread Id: 0xE1ED5000 File: SwiftManager.cpp Line: 186 Level: debug :: MSG_SU_STEP_STATUS, {Status:6,Compliant:3,RemStatus:1803564464,Phase:0,StepNumber:-1,Progress:-1,Attention:0,Cancellable:0,Restartable:0,ErrorMessage:1,Description1:"System scan not required on current Wi-Fi.",Description2:""}

Server http://192.168.0.122:3000:
Logs:
[   17.566908] kernel: dcdbas dcdbas: Dell Systems Management Base Driver (version 5.6.0-3.3)
[   12.488971] systemd[1]: Starting Remount Root and Kernel File Systems...
[   12.336349] systemd[1]: Condition check resulted in File System Check on Root Device being skipped.
[   12.051717] systemd[1]: Mounting Kernel Trace File System...
[   12.050303] systemd[1]: Mounting Kernel Debug File System...
```

#### Get last 5 entries containing the keyword from a log file for two serverURLs (one is invalid)
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log&numEntries=5&keyword=Function:%20loadXML&serverUrls=http://localhost:3001,http://localhost:3000"
```
##### Response
```
Server http://localhost:3001:
Error: An error occurred while reading the log file.

Server http://localhost:3000:
Logs:
Feb 12 01:10:13 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 12 01:09:13 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 12 01:08:13 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 12 01:07:13 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config
Feb 12 01:06:12 MacBook-Pro csc_iseagentd[1124]: Function: loadXMLCfgFile Thread Id: 0xE1ED5000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config```
```