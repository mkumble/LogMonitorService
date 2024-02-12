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
### Pre-requisite: Please follow the 'Running the service' instructions above.
### GET APIs:
#### Get system.log from local server
##### Curl Request: `curl http://localhost:3000/api/v1/logs`
##### Response: text/html

## Running unit tests
1. Make sure the server is not running on localhost 3000. 
2. Run `npm test` to run all the unit tests