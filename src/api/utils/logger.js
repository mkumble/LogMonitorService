//module for logging messages at different log levels
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const messageWithTimestamp = `${timestamp} - Error: ${message}`;
    switch (type) {
        case 'error':
            console.error(messageWithTimestamp);
            break;
        case 'debug':
            console.debug(messageWithTimestamp);
            break;
        case 'info':
        default:
            console.log(messageWithTimestamp);
            break;
    }
}

module.exports = {
    log
};
