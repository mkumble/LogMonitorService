const chai = require('chai');
const chaiHttp = require('chai-http');
const httpStatus = require('http-status-codes');
const sinon = require('sinon');
const app = require('../../../../src/app');
const {NUM_ENTRIES_MUST_BE_A_NUMBER, PATH_NOT_ALLOWED_IN_FILE_NAME, NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO} = require('../../../../src/api/errors/errorMessages');
const {LOGS_API_ENDPOINT_V1} = require('../../../../src/api/utils/apiEndpoints');
const errorHandlerService = require("../../../../src/api/v1/services/errorHandlerService");
const {FileDoesNotExistError, ValidationError} = require("../../../../src/api/errors/errorClasses");

chai.use(chaiHttp);
const {expect} = chai;
const {Readable} = require('stream');

const logsService = require('../../../../src/api/v1/services/logsService');
const ResponseTransform = require("../../../../src/api/v1/transforms/SingleResponseStreamTransform");

describe('GET /logs', function () {
    afterEach(function () {
        // Ensure the stub is restored after each test
        if (logsService.getLogs.restore) {
            logsService.getLogs.restore();
        }
    });

    it('should pass validation and controller should return expected response if fileName is valid (file exists)', function (done) {
        const validFileName = 'system.log';
        const expectedResponse = {"serverUrl": "http://localhost:3000",
            "fileName": "test",
            "logs": [
                "Log entry"
            ]}
        //assume getLogs returns a valid stream
        const logsStream = new Readable({
            read() {
                this.push(JSON.stringify(expectedResponse));
                this.push(null); // No more data
            }
        });

        // Stub the getLogs function to return a resolved promise with the logs stream
        sinon.stub(logsService, 'getLogs').returns(Promise.resolve(logsStream));

        chai.request(app)
            .get(LOGS_API_ENDPOINT_V1)
            .query({fileName: validFileName})
            .end(function (err, res) {
                expect(res).to.have.status(httpStatus.OK);
                expect(JSON.parse(res.text)).to.deep.equal(expectedResponse);
                done();
            });
    });

    it('should pass validation if numEntries is valid', function (done) {
        const validFileName = 'system.log';
        const expectedResponse = {"serverUrl": "http://localhost:3000",
            "fileName": "test",
            "logs": [
                "Log entry"
            ]}
        //assume getLogs returns a valid stream
        const logsStream = new Readable({
            read() {
                this.push(JSON.stringify(expectedResponse));
                this.push(null); // No more data
            }
        });

        // Stub the getLogs function to return a resolved promise with the logs stream
        sinon.stub(logsService, 'getLogs').returns(Promise.resolve(logsStream));

        chai.request(app)
            .get(LOGS_API_ENDPOINT_V1)
            .query({fileName: validFileName, numEntries: 4})
            .end(function (err, res) {
                expect(res).to.have.status(httpStatus.OK);
                expect(JSON.parse(res.text)).to.deep.equal(expectedResponse);
                done();
            });
    });

    it('responds with error for non-existent file', function(done) {
        const invalidFileName = 'non-existent-file.log';
        const expectedErrorStream = errorHandlerService.getErrorStream(new FileDoesNotExistError()).pipe(new ResponseTransform(invalidFileName, null, "error"))

        let expectedData = '';
        expectedErrorStream.on('data', chunk => {
            expectedData += chunk;
        });

        chai.request(app)
            .get(LOGS_API_ENDPOINT_V1)
            .query({fileName: invalidFileName})
            .buffer()
            .parse((res, done) => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    res.body = data; // Now res.body contains the complete response
                    done();
                });
            })
            .end(function (err, res) {
                expect(res).to.have.status(httpStatus.OK);
                expect(res.body).to.equal(expectedData);
                done();
            });
    });

    it('responds with error for invalid file name', function (done) {
        const invalidFileName = '../secrets.txt';
        const error = errorHandlerService.getResponse(invalidFileName, new ValidationError(PATH_NOT_ALLOWED_IN_FILE_NAME))

        chai.request(app)
            .get(LOGS_API_ENDPOINT_V1)
            .query({fileName: invalidFileName})
            .end(function (err, res) {
                expect(res).to.have.status(httpStatus.BAD_REQUEST);
                expect(res.body).to.deep.equal(error);
                done();
            });
    });


    it('responds with error for invalid numEntries(<1)', function(done) {
        const validFileName = 'system.log';
        const error = errorHandlerService.getResponse(validFileName, new ValidationError(NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO))

        chai.request(app)
            .get(LOGS_API_ENDPOINT_V1)
            .query({fileName: validFileName, numEntries: -5})
            .end(function (err, res) {
                expect(res).to.have.status(httpStatus.BAD_REQUEST);
                expect(res.body).to.deep.equal(error);
                done();
            });
    });


    it('responds with error for invalid numEntries(NaN)', function (done) {
        const validFileName = 'system.log';
        const error = errorHandlerService.getResponse(validFileName, new ValidationError(NUM_ENTRIES_MUST_BE_A_NUMBER))

        chai.request(app)
            .get(LOGS_API_ENDPOINT_V1)
            .query({fileName: validFileName, numEntries: 'test'})
            .end(function (err, res) {
                expect(res).to.have.status(httpStatus.BAD_REQUEST);
                expect(res.body).to.deep.equal(error);
                done();
            });
    });
});
