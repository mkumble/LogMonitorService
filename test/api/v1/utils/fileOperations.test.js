const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const expect = chai.expect;

const fileOperations = require('../../../../src/api/utils/fileOperations');

describe('readFileInReverse', () => {
    let readFileStub;

    beforeEach(() => {
        readFileStub = sinon.stub(fs, 'readFile');
    });

    //restore stubbing after each test case
    afterEach(() => {
        sinon.restore();
    });

    function testReadFileInReverse(mockData, numEntries, done) {
        const expectedData = mockData.split('\n').filter(Boolean).reverse().slice(0, numEntries).join('\n');
        readFileStub.callsFake((filePath, encoding, callback) => {
            callback(null, mockData);
        });

        fileOperations.readFileInReverse('filePath', numEntries, (err, data) => {
            expect(err).to.be.null;
            expect(data).to.equal(expectedData);
            done();
        });
    }

    //happy path
    it('returns the last n entries when numEntries matches the number of entries in the log file', (done) => {
        testReadFileInReverse('line1 \n line2 \n line3', 3, done);
    });

    it('skips the last line if it is empty', (done) => {
        testReadFileInReverse('line1 \n line2 \n', 1, done);
    });

    it('returns the last n entries when numEntries is less than the number of entries in the log file', (done) => {
        testReadFileInReverse('line1 \n line2 \n line3', 2, done);
    });

    it('returns all entries when numEntries is greater than the number of entries in the log file', (done) => {
        testReadFileInReverse('line1 \n line2 \n line3', 4, done);
    });

    //error
    it('calls the callback with an error if reading the file fails', (done) => {
        const mockError = new Error('error');
        readFileStub.callsFake((filePath, encoding, callback) => {
            callback(mockError);
        });

        fileOperations.readFileInReverse('filePath', 2, (err, data) => {
            expect(err).to.equal(mockError);
            expect(data).to.be.undefined;
            done();
        });
    });
});
