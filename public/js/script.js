//set default server URL to current server
window.onload = function () {
    document.getElementById('secondaryServerUrls').value = window.location.origin;
};

const CONSTANTS = {
    LOG_LOOKUP_SERVER: 'http://localhost:3000',
    LOGS_API_ENDPOINT_V1: '/api/v1/logs'
};

const ERROR_MESSAGES = {
    //error messages
    FILE_NAME_CANNOT_BE_EMPTY: 'File name cannot be empty',
    PATH_NOT_ALLOWED_IN_FILE_NAME: 'Path not allowed in file name',
    NUM_ENTRIES_MUST_BE_A_NUMBER: 'Number of entries must be a number',
    NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO: 'Number of entries must be greater than zero'
};

function validateFileName(fileName) {
    if (!fileName) {
        alert(ERROR_MESSAGES.FILE_NAME_CANNOT_BE_EMPTY);
        return false;
    }
    // Validate filename for invalid/malicious paths
    if (fileName.includes('/') || fileName.includes('..')) {
        alert(ERROR_MESSAGES.PATH_NOT_ALLOWED_IN_FILE_NAME);
        return false;
    }

    return true;
}

// Validates the numEntries query param
function validateNumEntries(numEntries) {
    // If numEntries is not present, skip validation
    if (!numEntries) {
        return true;
    }

    numEntries = Number(numEntries);

    if (isNaN(numEntries)) {
        alert(ERROR_MESSAGES.NUM_ENTRIES_MUST_BE_A_NUMBER);
        return false;
    }

    if (numEntries < 1) {
        alert(ERROR_MESSAGES.NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO);
        return false;
    }

    return true;
}

document.getElementById('logForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent the form from submitting normally

    const fileName = document.getElementById('fileName').value;
    const numEntries = document.getElementById('numEntries').value;
    const keyword = document.getElementById('keyword').value;
    const secondaryServerUrls = document.getElementById('secondaryServerUrls').value;

    // client side validation
    if (validateFileName(fileName) && validateNumEntries(numEntries)) {
        // Clear the logs element
        document.getElementById('logs').innerHTML = '';

        fetch(CONSTANTS.LOG_LOOKUP_SERVER + CONSTANTS.LOGS_API_ENDPOINT_V1 + `?numEntries=${numEntries}&keyword=${keyword}&fileName=${fileName}&serverUrls=${secondaryServerUrls}`)
            .then(response => response.text())
            .then(data => {
                const lines = data.split('\n');
                let currentServer = '';
                const servers = {};

                lines.forEach(line => {
                    if (line.startsWith('Server')) {
                        currentServer = line;
                        servers[currentServer] = [];
                    } else if (currentServer) {
                        servers[currentServer].push(line);
                    }
                });

                for (const server in servers) {
                    const logBox = document.createElement('div');
                    logBox.className = 'logBox';

                    const serverName = document.createElement('h3');
                    serverName.textContent = server;
                    logBox.appendChild(serverName);

                    const logData = document.createElement('pre');
                    logData.textContent = servers[server].join('\n');
                    logBox.appendChild(logData);

                    document.getElementById('logs').appendChild(logBox);
                }
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }
});