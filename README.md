# Log Monitor Service
This service provides on-demand monitoring of various Unix-based servers without having to log into each individual machine and opening up the log files found in /var/log.

## Requirements, Design & Architecture:
Detailed information about the requirements, design, and architecture of this service can be found here: https://docs.google.com/document/d/13GyRpE5BllY1iMDoQd9ffszhTRFUfHQzeOUxAGgiXe4/edit?usp=sharing

## Slides
https://docs.google.com/presentation/d/1OCeanbiMNvIxMadFP_EQ70dWTBia9Fp5J86VLnG8ipY/edit#slide=id.p

## Implementation
```text
1. logsRouter: Accepts the HTTP GET requests for the logs API Endpoints and directs to the logsValidator.
2. logsValidator: Validates the fileName and numEntries in the input request and directs to the logsController
3. logsController Ingress: Invokes the logService module for the request.
4. logsService: Creates streams either from the local logs and/or remote logs based on the serverUrls. 
     i. Local logs: 
         a. logFileOperations utility is used to read the local logs data asynchronously to a stream. 
         b. The stream is filtered based on the criteria using the LogsStreamTransform class.
         c. The stream is then formatted as JSON using the SingleResponseStreamTransform class.
     ii. Remote logs:
         a. Using the reqResHandlerService, a request is made for each of the serverUrls along with the search criteria. 
            The request is considered as a local log lookup request by the remote server and the stream is returned as specified above.
         b. The stream response format will be the same as the one returned for local logs.
    The array of streams are then transformed using the MultiResponseStreamTransform class (formatting the complete payload as a valid JSON).
5. logsController Egress: Return the data as json in the HTTP Response.
```

## Installation
```text
Follow these steps to install the service:
1. Make sure npm is installed on the host.
2. Clone the repo: `git clone https://github.com/mkumble/LogMonitorService.git`
3. Install dependencies: ```cd LogMonitorService; npm install```
```

## Configuration
```text
Modify the default configurations defined in `LogMonitorService/src/api/utils/constants.js` as needed (Example: change SERVER_PORT)
```

## Running the service
```text
1. Follow the Installation instructions above.
2. Open the terminal and navigate to the src directory: `cd LogMonitorService/src`
3. Start the node.js application: `node app.js`. By default, the server runs on `http://localhost:3000`
```

## UI
After running the service, UI can be accessed on `http://localhost:3000/index.html`
![Log Monitor UI Phase1](./images/LogMonitorUI_Phase1.png)
![Log Monitor UI Phase2](./images/LogMonitorUI_Phase2.png)

## Tests
### Running unit tests
```text
1. Make sure the server is not running on localhost 3000.
2. Run `npm test` to run all the unit tests
```

## Committing Changes
```text
1. Commits follow the conventional commit specification https://www.conventionalcommits.org/en/v1.0.0/#specification
2. API design is based on OpenAPI specification https://swagger.io/specification/
```

## API: (GET) Log file lookup
#### Pre-requisite: Please follow the 'Running the service' instructions above.
```
GET /api/v1/logs
```
Retrieve a log file from local and/or remote server(s).

### Parameters:

| Name       | Type   | Mandatory | Description                                                                                                                                                                      |
|------------|--------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| fileName   | STRING | YES       | A valid fileName (in /var/logs) on the local server.                                                                                                                             |
| numEntries | NUMBER | NO        | Number of log lines/entries to retrieve.                                                                                                                                         |
| keyword    | STRING | NO        | An encoded case-sensitive string to search in the log file.                                                                                                                      |
| serverUrls | STRING | NO        | Comma separated list of server URLs with port (`SECONDARY SERVER URL FORMAT: http://<IP OR HOSTNAME>:<PORT>`). These secondary servers must be running the REST API application. |

## Data Source:
Filesystem OR a Secondary Server REST Endpoint

## Response:
Format: `application/json`

### Sample Response Templates:
#### Single Server Response:

Success:
```json
{
  "serverUrl": "<SERVER_URL>",
  "fileName": "<FILE_NAME>",
  "httpStatusCode": "<HTTP STATUS FOR THE CURRENT PAYLOAD>",
  "logs": [
    "<LOG LINE 1>",
    "<LOG LINE 2>"
  ]
}
```
Note: Logs are ordered from latest to oldest.
<br>
<br>
Error:
```json
{
  "serverUrl": "<SERVER_URL>",
  "fileName": "<FILE_NAME>",
  "httpStatusCode": "<HTTP STATUS FOR THE CURRENT PAYLOAD>",
  "errors": [
    "<ERROR MESSAGE 1>",
    "<ERROR MESSAGE 2>"
  ]
}
```
<br>

#### Multi-Server Response
Success:
```json
[
  {
    "serverUrl": "<SERVER_URL_1>",
    "fileName": "<FILE_NAME>",
    "httpStatusCode": "<HTTP STATUS FOR THE CURRENT PAYLOAD>",
    "logs": [
      "<LOG LINE 1>",
      "<LOG LINE 2>"
    ]
  },
  {
    "serverUrl": "<SERVER_URL_2>",
    "fileName": "<FILE_NAME>",
    "httpStatusCode": "<HTTP STATUS FOR THE CURRENT PAYLOAD>",
    "logs": [
      "<LOG LINE 1>",
      "<LOG LINE 2>"
    ]
  }
]
```
Note: Logs are ordered from latest to oldest.
<br>
<br>
Error:
```json
[
  {
    "serverUrl": "<SERVER_URL_1>",
    "fileName": "<FILE_NAME>",
    "httpStatusCode": "<HTTP STATUS FOR THE CURRENT PAYLOAD>",
    "errors": [
      "<ERROR MESSAGE 1>",
      "<ERROR MESSAGE 2>"
    ]
  },
  {
    "serverUrl": "<SERVER_URL_2>",
    "fileName": "<FILE_NAME>",
    "httpStatusCode": "<HTTP STATUS FOR THE CURRENT PAYLOAD>",
    "errors": [
      "<ERROR MESSAGE 1>",
      "<ERROR MESSAGE 2>"
    ]
  }
]
```
<br>

### Sample Scenarios:
##### Happy Paths:
| Input                                                                                                           | Secondary Server Response Payload HTTP Status Code           | HTTP Response Status Code | Output/Error Message                                                                     |
|-----------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------------------|
| Valid fileName                                                                                                  | 200                                                               | 200                                                       | Complete logs of the file (latest to old).                                               |
| Valid fileName, Valid numEntries                                                                                | 200                                                               | 200                                                       | Most Recent 'numEntries' lines of the file.                                              |
| Valid fileName, Valid numEntries, Valid (URL encoded) keyword                                                   | 200                                                               | 200                                                       | Most recent 'numEntries' lines of the file containing the keyword/text.                  |
| Valid fileName, Valid numEntries, Valid (URL encoded) keyword, Valid serverURLs (all reachable servers)         | 200                                                               | 200                                                       | Most recent 'numEntries' lines of the file containing the keyword/text for each serverURL |
| Valid fileName, Valid numEntries, Valid (URL encoded) keyword, Valid serverURLs (with some unreachable servers) | 200 / 404 / 408 / 500 (depending on the secondary server response) | 200                                                       | Combination of success and error message response based on the serverURL.                |

<br>

##### Error Paths:
| Input                                                               | Secondary Server Response Payload HTTP Status Code | HTTP Response Status Code | Output/Error Message                                                  |
|---------------------------------------------------------------------|----------------------------------------------------|---------------------------|-----------------------------------------------------------------------|
| Missing fileName                                                    | 400                                                | 400                       | File name cannot be empty.                                            |
| FileName containing path                                            | 400                                                | 400                       | Path not allowed in file name.                                        |
| File doesn't exist in /var/log                                      | 404                                                | 200                       | File does not exist.                       |
| numEntries < 1                                                      | 400                                                | 400                       | Number of Entries must be greater than 0.                             |
| numEntries is NaN                                                   | 400                                                | 400                       | Number of Entries query param must be a number.                       |
| A serverURL in serverUrls param is invalid                          | 400                                                | 400                       | Invalid Server URL: < invalid server url in request >                 |
| File doesn't exist in some secondary server(s)                      | 404                                                | 200                       | File does not exist. |
| Request timeout in some secondary server(s)                         | 408                                                | 200                       | The request to the server timed out.                                                                     |
| File Stream Read Error / Generic Errors on some secondary server(s) | 500                                                | 200                       | Internal Server Error occurred.                                                                                                         |

### Sample Requests/Response

#### Get all logs from a log file
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=systemshort.log"
```
##### Response

```json
{
  "serverUrl": "http://localhost:3000",
  "fileName": "systemshort.log",
  "httpStatusCode": 200,
  "logs": [
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter en5, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter en6, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter en1, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter en2, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter en3, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter bridge0, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter ap1, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter en0, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter awdl0, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter llw0, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1281 Level: debug :: discarding interface utun0 with gateway fe80::",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter utun0, operStatus=1, wifi=no",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1281 Level: debug :: discarding interface utun1 with gateway fe80::",
    "Feb 14 00:12:18 MacBook-Pro csc_iseagentd[1170]: Function: collectNoMntTargets Thread Id: 0xE2801000 File: SwiftHttpRunner.cpp Line: 1214 Level: debug :: adapter utun1, operStatus=1, wifi=no",
    "Feb 14 00:09:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:08:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:07:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:06:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:05:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:04:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:03:38 MacBook-Pro syslogd[342]: ASL Sender Statistics",
    "Feb 14 00:03:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:02:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:01:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 14 00:00:38 MacBook-Pro csc_iseagentd[1170]: Function: loadXMLCfgFile Thread Id: 0xE2801000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config"
  ]
}
```

#### Get last 3 entries from a log file
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log&numEntries=3"
```
##### Response
```json
{
  "serverUrl": "http://localhost:3000",
  "fileName": "system.log",
  "httpStatusCode": 200,
  "logs": [
    "Feb 17 18:49:47 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 17 18:49:05 MacBook-Pro Cisco Secure Client[864]: Function: loadXMLCfgFile Thread Id: 0x6FAF3000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 17 18:49:05 --- last message repeated 1 time ---"
  ]
}
```

#### Get last 5 entries containing the keyword from a log file
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log&numEntries=5&keyword=Function:%20loadXML"
```
##### Response
```json
{
  "serverUrl": "http://localhost:3000",
  "fileName": "system.log",
  "httpStatusCode": 200,
  "logs": [
    "Feb 17 18:49:47 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 17 18:49:05 MacBook-Pro Cisco Secure Client[864]: Function: loadXMLCfgFile Thread Id: 0x6FAF3000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 17 18:49:05 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 17 18:49:05 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
    "Feb 17 18:48:47 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config"
  ]
}
```

#### Get last 5 entries containing the keyword from a log file for two serverURLs (both are valid)
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log&numEntries=5&keyword=System&serverUrls=http://localhost:3000,http://192.168.0.122:3000"
```
##### Response
```json
[
  {
    "serverUrl": "http://localhost:3000",
    "fileName": "system.log",
    "httpStatusCode": 200,
    "logs": [
      "Feb 17 18:49:05 MacBook-Pro csc_iseagentd[1152]: Function: sendUIStatus Thread Id: 0xD832D000 File: SwiftManager.cpp Line: 186 Level: debug :: MSG_SU_STEP_STATUS, {Status:6,Compliant:3,RemStatus:1796322720,Phase:0,StepNumber:-1,Progress:-1,Attention:0,Cancellable:0,Restartable:0,ErrorMessage:1,Description1:\"System scan not required on current Wi-Fi.\",Description2:\"\"}",
      "Feb 17 18:49:05 MacBook-Pro csc_iseagentd[1152]: Function: getIpAndMacList Thread Id: 0xD832D000 File: SystemInfo.cpp Line: 131 Level: debug :: MAC List=86:13:9A:27:06:80,86:13:9A:27:06:81,86:13:9A:27:06:5F,86:13:9A:27:06:60,86:13:9A:27:06:61,36:AC:CE:97:8A:40,36:AC:CE:97:8A:44,36:AC:CE:97:8A:48,36:AC:CE:97:8A:40,6E:7E:67:BB:53:F0,6C:7E:67:BB:53:F0,6C:7E:67:BB:53:F0,BA:D3:C4:5E:13:1C,BA:D3:C4:5E:13:1C,86:13:9A:27:06:7F,86:13:9A:27:06:7F,86:13:9A:27:06:7F,86:13:9A:27:06:7F, IP List=0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,fe80::6c7e:67ff:febb:53f0,192.168.0.237,fe80::4ac:ab26:9f2f:7a6c,fe80::b8d3:c4ff:fe5e:131c,fe80::b8d3:c4ff:fe5e:131c,fe80::a576:3b3a:76d8:44e8,fe80::ece0:4d7b:82b:de1c,fe80::60bc:1417:4142:6ace,fe80::ce81:b1c:bd2c:69e, saved MAC=86:13:9A:27:06:7F",
      "Feb 17 18:19:05 MacBook-Pro csc_iseagentd[1152]: Function: sendUIStatus Thread Id: 0xD832D000 File: SwiftManager.cpp Line: 186 Level: debug :: MSG_SU_STEP_STATUS, {Status:6,Compliant:3,RemStatus:1796322720,Phase:0,StepNumber:-1,Progress:-1,Attention:0,Cancellable:0,Restartable:0,ErrorMessage:1,Description1:\"System scan not required on current Wi-Fi.\",Description2:\"\"}",
      "Feb 17 18:19:05 MacBook-Pro csc_iseagentd[1152]: Function: getIpAndMacList Thread Id: 0xD832D000 File: SystemInfo.cpp Line: 131 Level: debug :: MAC List=86:13:9A:27:06:80,86:13:9A:27:06:81,86:13:9A:27:06:5F,86:13:9A:27:06:60,86:13:9A:27:06:61,36:AC:CE:97:8A:40,36:AC:CE:97:8A:44,36:AC:CE:97:8A:48,36:AC:CE:97:8A:40,6E:7E:67:BB:53:F0,6C:7E:67:BB:53:F0,6C:7E:67:BB:53:F0,BA:D3:C4:5E:13:1C,BA:D3:C4:5E:13:1C,86:13:9A:27:06:7F,86:13:9A:27:06:7F,86:13:9A:27:06:7F,86:13:9A:27:06:7F, IP List=0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,0.0.0.0,fe80::6c7e:67ff:febb:53f0,192.168.0.237,fe80::4ac:ab26:9f2f:7a6c,fe80::b8d3:c4ff:fe5e:131c,fe80::b8d3:c4ff:fe5e:131c,fe80::a576:3b3a:76d8:44e8,fe80::ece0:4d7b:82b:de1c,fe80::60bc:1417:4142:6ace,fe80::ce81:b1c:bd2c:69e, saved MAC=86:13:9A:27:06:7F",
      "Feb 17 17:49:05 MacBook-Pro csc_iseagentd[1152]: Function: sendUIStatus Thread Id: 0xD832D000 File: SwiftManager.cpp Line: 186 Level: debug :: MSG_SU_STEP_STATUS, {Status:6,Compliant:3,RemStatus:1796322720,Phase:0,StepNumber:-1,Progress:-1,Attention:0,Cancellable:0,Restartable:0,ErrorMessage:1,Description1:\"System scan not required on current Wi-Fi.\",Description2:\"\"}"
    ]
  },
  {
    "serverUrl": "http://192.168.0.122:3000",
    "fileName": "system.log",
    "httpStatusCode": 200,
    "logs": [
      "[   17.566908] kernel: dcdbas dcdbas: Dell Systems Management Base Driver (version 5.6.0-3.3)",
      "[   12.488971] systemd[1]: Starting Remount Root and Kernel File Systems...",
      "[   12.336349] systemd[1]: Condition check resulted in File System Check on Root Device being skipped.",
      "[   12.051717] systemd[1]: Mounting Kernel Trace File System...",
      "[   12.050303] systemd[1]: Mounting Kernel Debug File System..."
    ]
  }
]
```

#### Get last 5 entries containing the keyword from a log file for two serverURLs (one is invalid)
##### Request
```text
curl "http://localhost:3000/api/v1/logs?fileName=system.log&numEntries=5&keyword=Function:%20loadXML&serverUrls=http://localhost:3001,http://localhost:3000"
```
##### Response
```json
[
  {
    "serverUrl": "http://localhost:3001",
    "fileName": "system.log",
    "httpStatusCode": 500,
    "errors": [
      "The target server is not accepting connections."
    ]
  },
  {
    "serverUrl": "http://localhost:3000",
    "fileName": "system.log",
    "httpStatusCode": 200,
    "logs": [
      "Feb 17 18:51:47 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
      "Feb 17 18:50:47 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
      "Feb 17 18:49:47 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
      "Feb 17 18:49:05 MacBook-Pro Cisco Secure Client[864]: Function: loadXMLCfgFile Thread Id: 0x6FAF3000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config",
      "Feb 17 18:49:05 MacBook-Pro csc_iseagentd[1152]: Function: loadXMLCfgFile Thread Id: 0xD832D000 File: ConfigData.cpp Line: 43 Level: info :: ISEPostureCFG.xml present. Using it for config"
    ]
  }
]
```
