const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const expect = chai.expect;

const fileOperations = require('../../../../src/api/utils/fileOperations');

describe('readFileInReverse', () => {
    let readFileMock;

    beforeEach(() => {
        readFileMock = sinon.stub(fs, 'readFile');
    });

    //restore stubbing after each test case
    afterEach(() => {
        sinon.restore();
    });

    function testReadFileInReverse(mockData, numEntries, keyword, done) {
        const expectedData = mockData.split('\n').filter(Boolean).reverse().slice(0, numEntries).join('\n');
        readFileMock.callsFake((filePath, encoding, callback) => {
            callback(null, mockData);
        });

        fileOperations.readFileInReverse('filePath', numEntries, keyword, (err, data) => {
            expect(err).to.be.null;
            expect(data).to.equal(expectedData);
            if (keyword) {
                expect(data.includes(keyword)).to.be.true;
            }
            done();
        });
    }

    //happy path
    it('returns the last n entries when numEntries matches the number of entries in the log file', (done) => {
        testReadFileInReverse('line1 \n line2 \n line3', 3, null, done);
    });

    it('skips the last line if it is empty', (done) => {
        testReadFileInReverse('line1 \n line2 \n', 1, null, done);
    });

    it('returns the last n entries when numEntries is less than the number of entries in the log file', (done) => {
        testReadFileInReverse('line1 \n line2 \n line3', 2, null, done);
    });

    it('returns all entries when numEntries is greater than the number of entries in the log file', (done) => {
        testReadFileInReverse('line1 \n line2 \n line3', 4, null, done);
    });

    it('returns the last n entries containing the keyword when numEntries matches the number of entries in the log file', (done) => {
        testReadFileInReverse('line1 \n line2 \n line3', 3, 'line', done);
    });

    it('returns the last n entries containing the keyword when numEntries matches the number of entries in the log file', (done) => {
        const mockData = 'line1 \n keyword line2 \n keyword line3';
        const numEntries = 2;
        const keyword = 'keyword';
        const expectedData = mockData.split('\n').filter(line => line.includes(keyword)).reverse().slice(0, numEntries).join('\n');
        readFileMock.callsFake((filePath, encoding, callback) => {
            callback(null, mockData);
        });

        fileOperations.readFileInReverse('filePath', numEntries, keyword, (err, data) => {
            expect(err).to.be.null;
            expect(data).to.equal(expectedData);
            done();
        });
    });

    //error
    it('calls the callback with an error if reading the file fails', (done) => {
        const mockError = new Error('error');
        readFileMock.callsFake((filePath, encoding, callback) => {
            callback(mockError);
        });

        fileOperations.readFileInReverse('filePath', 2, null, (err, data) => {
            expect(err).to.equal(mockError);
            expect(data).to.be.undefined;
            done();
        });
    });
});
