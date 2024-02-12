const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const expect = chai.expect;
const fileOperations = require('../../../../src/api/utils/fileOperations'); // adjust the path as needed

describe('readFile', () => {
    //restore stubbing
    afterEach(() => {
        sinon.restore();
    });

    //happy path
    it('reads a file successfully and call the callback with the file content', (done) => {
        const mockData = 'mock data';
        sinon.stub(fs, 'readFile').callsFake((filePath, encoding, callback) => {
            callback(null, mockData);
        });

        fileOperations.readFile('filePath', (err, data) => {
            expect(err).to.be.null;
            expect(data).to.equal(mockData);
            done();
        });
    });

    //error scenario
    it('fails reading the file and calls the callback with an error', (done) => {
        const mockError = new Error('error');
        sinon.stub(fs, 'readFile').callsFake((filePath, encoding, callback) => {
            callback(mockError);
        });

        fileOperations.readFile('filePath', (err, data) => {
            expect(err).to.equal(mockError);
            expect(data).to.be.undefined;
            done();
        });
    });
});
