const chai = require('chai');
const httpStatus = require('http-status-codes');
const sinon = require('sinon');
const {expect} = chai;

const {FILE_NAME_CANNOT_BE_EMPTY, PATH_NOT_ALLOWED_IN_FILE_NAME} = require('../../../../src/api/utils/errorMessages');
const logsValidator = require('../../../../src/api/v1/validations/logsValidator');

describe('validateRequest', () => {
    let req, res, next;

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

    it('should return error if fileName is empty', () => {
        logsValidator.validateRequest(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        expect(res.send.calledWith(FILE_NAME_CANNOT_BE_EMPTY)).to.be.true;
    });

    it('should return error if fileName contains path(/)', () => {
        req.query.fileName = 'test/';
        logsValidator.validateRequest(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        expect(res.send.calledWith(PATH_NOT_ALLOWED_IN_FILE_NAME)).to.be.true;
    });

    it('should return error if fileName contains path(..)', () => {
        req.query.fileName = 'test..';
        logsValidator.validateRequest(req, res, next);
        expect(res.status.calledWith(httpStatus.BAD_REQUEST)).to.be.true;
        expect(res.send.calledWith(PATH_NOT_ALLOWED_IN_FILE_NAME)).to.be.true;
    });

    it('should call next if fileName is valid', () => {
        req.query.fileName = 'test';
        logsValidator.validateRequest(req, res, next);
        expect(next.calledOnce).to.be.true;
    });
});
