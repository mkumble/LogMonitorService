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
        alert(PATH_NOT_ALLOWED_IN_FILE_NAME);
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
        alert(NUM_ENTRIES_MUST_BE_A_NUMBER);
        return false;
    }

    if (numEntries < 1) {
        alert(NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO);
        return false;
    }

    return true;
}


document.getElementById('logForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent the form from submitting normally

    const fileName = document.getElementById('fileName').value;
    const numEntries = document.getElementById('numEntries').value;
    const keyword = document.getElementById('keyword').value;

    // client side validation
    if (validateFileName(fileName) && validateNumEntries(numEntries)) {
        fetch(CONSTANTS.LOG_LOOKUP_SERVER + CONSTANTS.LOGS_API_ENDPOINT_V1 + `?numEntries=${numEntries}&keyword=${keyword}&fileName=${fileName}`)
            .then(response => response.text())
            .then(data => {
                document.getElementById('logs').textContent = data;
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }
});
