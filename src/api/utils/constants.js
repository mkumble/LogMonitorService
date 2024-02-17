//module for storing re-usable constants
module.exports = {
    CONTENT_TYPE_APPLICATION_JSON: 'application/json',
    LOG_FILES_BASE_PATH: '/var/log',
    // protocol will be https in a prod env (requests will be TLS encrypted)
    REQUEST_PROTOCOL: 'http',
    // milliseconds to wait before timing out on remote servers
    SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS: 5000,
    SERVER_HOST_NAME: 'localhost',
    SERVER_PORT: '3000',
    UTF8_ENCODING: 'utf8',
    get CURRENT_SERVER_URL() {
        return `${this.REQUEST_PROTOCOL}://${this.SERVER_HOST_NAME}:${this.SERVER_PORT}`;
    }
};
