const chai = require('chai');
const httpStatus = require('http-status-codes');
const sinon = require('sinon');
const {expect} = chai;

const {
    FILE_NAME_CANNOT_BE_EMPTY,
    INVALID_SECONDARY_SERVER_URL_HOST_NAME,
    PATH_NOT_ALLOWED_IN_FILE_NAME,
    NUM_ENTRIES_MUST_BE_A_NUMBER,
    NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO
} = require('../../../../src/api/errors/errorMessages');
const logsValidator = require('../../../../src/api/v1/validations/logsValidator');
const errorHandlerService = require("../../../../src/api/v1/services/errorHandlerService");
const {ValidationError} = require("../../../../src/api/errors/errorClasses");

describe('validateRequest', () => {
    let req, res, next;

    //resetting before each test case
    beforeEach(() => {
        req = {
            query: {}
        };
        res = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub()
        };
        next = sinon.stub();
    });

    //validating fileName
    it('should return error if fileName is empty', () => {
        logsValidator.validateFileName(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        const responseMessage = errorHandlerService.getResponse(null, new ValidationError(FILE_NAME_CANNOT_BE_EMPTY));
        expect(res.send.calledWith(responseMessage)).to.be.true;
    });

    it('should return error if fileName contains path(/)', () => {
        req.query.fileName = 'test/';
        logsValidator.validateFileName(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        const responseMessage = errorHandlerService.getResponse(req.query.fileName, new ValidationError(PATH_NOT_ALLOWED_IN_FILE_NAME));
        expect(res.send.calledWith(responseMessage)).to.be.true;
    });

    it('should return error if fileName contains path(..)', () => {
        req.query.fileName = 'test..';
        logsValidator.validateFileName(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        const responseMessage = errorHandlerService.getResponse(req.query.fileName, new ValidationError(PATH_NOT_ALLOWED_IN_FILE_NAME));
        expect(res.send.calledWith(responseMessage)).to.be.true;
    });

    it('should call next if fileName is valid', () => {
        req.query.fileName = 'test';
        logsValidator.validateFileName(req, res, next);
        expect(next.calledOnce).to.be.true;
    });

    //validating numEntries
    it('should skip validation if numEntries is not present', () => {
        logsValidator.validateNumEntries(req, res, next);
        expect(next.calledOnce).to.be.true;
    });

    it('should return error if numEntries is not a number', () => {
        req.query.numEntries = 'test';
        logsValidator.validateNumEntries(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        const responseMessage = errorHandlerService.getResponse(null, new ValidationError(NUM_ENTRIES_MUST_BE_A_NUMBER));
        expect(res.send.calledWith(responseMessage)).to.be.true;
    });

    it('should return error if numEntries is less than or equal to zero', () => {
        req.query.numEntries = '0';
        logsValidator.validateNumEntries(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        const responseMessage = errorHandlerService.getResponse(null, new ValidationError(NUM_ENTRIES_MUST_BE_GREATER_THAN_ZERO));
        expect(res.send.calledWith(responseMessage)).to.be.true;
    });

    it('should call next if numEntries is valid', () => {
        req.query.numEntries = '10';
        logsValidator.validateNumEntries(req, res, next);
        expect(next.calledOnce).to.be.true;
    });

    it('should skip validation if serverUrls is not present', () => {
        logsValidator.validateServerUrls(req, res, next);
        expect(next.calledOnce).to.be.true;
    });

    it('should return error if serverUrls is invalid', () => {
        req.query.serverUrls = 'invalid-url';
        logsValidator.validateServerUrls(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        const responseMessage = errorHandlerService.getResponse(req.query.fileName, new ValidationError(INVALID_SECONDARY_SERVER_URL_HOST_NAME + ": " + req.query.serverUrls));
        expect(res.send.calledWith(responseMessage)).to.be.true;
    });

    it('should call next if serverUrls is valid', () => {
        req.query.serverUrls = 'https://www.test.com';
        logsValidator.validateServerUrls(req, res, next);
        expect(next.calledOnce).to.be.true;
    });
});
