//module for storing re-usable constants
module.exports = {
    ENCODING: 'utf8',
    LOG_FILES_BASE_PATH: '/var/log',
    // protocol will be https in a prod env (requests will be TLS encrypted)
    REQUEST_PROTOCOL: 'http',
    SECONDARY_SERVER_REQUEST_TIMEOUT_MILLIS: 2000,
    SERVER_HOST_NAME: 'localhost',
    SERVER_PORT: '3000',
    get PRIMARY_SERVER_URL() {
        return this.REQUEST_PROTOCOL + "://" + this.SERVER_HOST_NAME + ":" + this.SERVER_PORT;
    }
};
