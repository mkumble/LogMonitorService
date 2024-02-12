//module for storing re-usable constants
module.exports = {
    ENCODING: 'utf8',
    LOG_FILES_BASE_PATH: '/var/log',
    // protocol will be https in a prod env (requests will be TLS encrypted)
    REQUEST_PROTOCOL: 'http',
    SERVER_HOST_NAME: 'localhost',
    SERVER_PORT: '3000'
};
