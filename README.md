# Log Monitor Service
This service provides on-demand monitoring of various Unix-based servers without having to log into each individual machine and opening up the log files found in /var/log.

## Requirements, Design & Architecture:
Detailed information about the requirements, design, and architecture of this service can be found here: https://docs.google.com/document/d/13GyRpE5BllY1iMDoQd9ffszhTRFUfHQzeOUxAGgiXe4/edit?usp=sharing

## Installation
Follow these steps to install the service:
1. Clone the repo: `git clone git@github.com:mkumble/LogMonitorService.git`
2. Install dependencies: ```cd LogMonitorService; npm install```

## Configuration
1. Modify the default configurations defined in `LogMonitorService/src/api/utils/constants.js` as needed.

## Running the service
1. Follow the Installation instructions.
2. Open the terminal and navigate to the src directory: `cd LogMonitorService/src`
3. Start the node.js application: `node app.js`. By default, the server runs on `http://localhost:3000`

## APIs
#### Pre-requisite: Please follow the 'Running the service' instructions above.

### (GET) Log file lookup
```
GET /api/v1/logs
```
Retrieve a log file from local server.

**Parameters:**

| Name       | Type   | Mandatory | Description                                          |
|------------|--------|-----------|------------------------------------------------------|
| fileName   | STRING | YES       | A valid fileName (in /var/logs) on the local server. |
| numEntries | NUMBER | NO        | Number of log lines/entries to retrieve.             |

**Data Source:**
Filesystem

**Response:**
Input | Status | Status Code | Output/Error Message
------------ | ------------ | ------------ | ------------
Valid fileName | Success | 200 | Complete logs of the file (latest to old).
Valid fileName, Valid numEntries | Success | 200 | 'numEntries' lines of the file (latest to old).
Missing fileName | Error | 400 | File name cannot be empty.
FileName containing path | Error | 400 | Path not allowed in file name.
File doesn't exist in /var/log | Error | 500 | An error occurred while reading the log file.
numEntries < 1 | Error | 400 | Number of Entries must be greater than 0.
numEntries is NaN | Error | 400 | Number of Entries query param must be a number.

## Running unit tests
1. Make sure the server is not running on localhost 3000. 
2. Run `npm test` to run all the unit tests