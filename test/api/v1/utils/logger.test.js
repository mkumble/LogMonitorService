const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const logger = require('../../../../src/api/utils/logger');

describe('log', () => {
    let consoleLogMock;
    let consoleErrorMock;
    let consoleDebugMock;

    beforeEach(() => {
        consoleLogMock = sinon.stub(console, 'log');
        consoleErrorMock = sinon.stub(console, 'error');
        consoleDebugMock = sinon.stub(console, 'debug');
    });

    afterEach(() => {
        consoleLogMock.restore();
        consoleErrorMock.restore();
        consoleDebugMock.restore();
    });

    it('logs info messages', () => {
        logger.log('Info message');
        expect(consoleLogMock.calledOnce).to.be.true;
    });

    it('logs error messages', () => {
        logger.log('Error message', 'error');
        expect(consoleErrorMock.calledOnce).to.be.true;
    });

    it('logs debug messages', () => {
        logger.log('Debug message', 'debug');
        expect(consoleDebugMock.calledOnce).to.be.true;
    });
});

