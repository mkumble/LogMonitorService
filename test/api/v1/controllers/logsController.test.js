const chai = require('chai');
const chaiHttp = require('chai-http');
const httpStatus = require('http-status-codes');

const app = require('../../../../src/app');
const {LOG_FILE_READ_ERROR, PATH_NOT_ALLOWED_IN_FILE_NAME} = require('../../../../src/api/utils/errorMessages');
const {LOGS_API_ENDPOINT_V1} = require('../../../../src/api/utils/apiEndpoints');

chai.use(chaiHttp);
const {expect} = chai;

//happy path
it('should pass validation if fileName is valid (file exists)', (done) => {
    const validFileName = 'system.log';
    chai.request(app)
        .get(LOGS_API_ENDPOINT_V1)
        .query({fileName: validFileName})
        .end((err, res) => {
            expect(res).to.have.status(httpStatus.OK);
            done();
        });
});

describe('GET /logs', function () {
    it('responds with error for non-existent file', function (done) {
        const invalidFileName = 'non-existent-file.log';
        chai.request(app)
            .get(LOGS_API_ENDPOINT_V1)
            .query({fileName: invalidFileName})
            .end(function (err, res) {
                expect(res).to.have.status(httpStatus.INTERNAL_SERVER_ERROR);
                expect(res.text).to.equal(LOG_FILE_READ_ERROR);
                done();
            });
    });

    it('responds with error for invalid file name', function (done) {
        const invalidFileName = '../secrets.txt';
        chai.request(app)
            .get(LOGS_API_ENDPOINT_V1)
            .query({fileName: invalidFileName})
            .end(function (err, res) {
                expect(res).to.have.status(httpStatus.BAD_REQUEST);
                expect(res.text).to.equal(PATH_NOT_ALLOWED_IN_FILE_NAME);
                done();
            });
    });
});
