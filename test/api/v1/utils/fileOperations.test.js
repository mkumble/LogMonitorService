const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const expect = chai.expect;
const fileOperations = require('../../../../src/api/utils/fileOperations');

describe('readFileInReverse', () => {
    //restore stubbing
    afterEach(() => {
        sinon.restore();
    });

    //happy path
    it('reads a file successfully and call the callback with the reversed file content', (done) => {
        const mockData = 'line1 \n line2';
        const mockDateInReverse = mockData.split('\n').reverse().join('\n');
        sinon.stub(fs, 'readFile').callsFake((filePath, encoding, callback) => {
            callback(null, mockData);
        });

        fileOperations.readFileInReverse('filePath', (err, data) => {
            expect(err).to.be.null;
            expect(data).to.equal(mockDateInReverse);
            done();
        });
    });

    //error scenario
    it('fails reading the file and calls the callback with an error', (done) => {
        const mockError = new Error('error');
        sinon.stub(fs, 'readFile').callsFake((filePath, encoding, callback) => {
            callback(mockError);
        });

        fileOperations.readFileInReverse('filePath', (err, data) => {
            expect(err).to.equal(mockError);
            expect(data).to.be.undefined;
            done();
        });
    });
});
