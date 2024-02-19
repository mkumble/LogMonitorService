const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const fs = require('fs');
const FileReader = require('../../../../src/api/utils/FileReader');

describe('FileReader', function () {
    let existsSyncStub, openSyncStub, statSyncStub, readSyncStub, closeSyncStub;
    let mockData ='fake file content1\nfake file content2';
    let expectedData = 'fake file content2fake file content1';
    const mockDataBuffer = Buffer.from(mockData);

    before(function () {
        existsSyncStub = sinon.stub(fs, 'existsSync');
        openSyncStub = sinon.stub(fs, 'openSync');
        statSyncStub = sinon.stub(fs, 'statSync');
        readSyncStub = sinon.stub(fs, 'readSync');
        closeSyncStub = sinon.stub(fs, 'closeSync');
    });

    after(function () {
        existsSyncStub.restore();
        openSyncStub.restore();
        statSyncStub.restore();
        readSyncStub.restore();
        closeSyncStub.restore();
    });

    function stubFSMethods() {
        existsSyncStub.returns(true);
        openSyncStub.returns(123);
        statSyncStub.returns({size: mockDataBuffer.length});
        readSyncStub.callsFake((fd, buffer, offset) => {
            mockDataBuffer.copy(buffer, offset, 0, mockDataBuffer.length);
            // return the number of bytes read
            return mockDataBuffer.length;
        });
    }
    describe('#constructor()', function () {
        it('should throw error when file does not exist', function () {
            existsSyncStub.returns(false);
            expect(() => new FileReader('nonexistent.txt', true)).to.throw();
        });

        it('should not throw error when file exists', function () {
            stubFSMethods();
            expect(() => new FileReader('existing.txt', true)).to.not.throw();
        });
    });

    describe('#_read()', function () {
        it('should read file in reverse order', function (done) {
            stubFSMethods();
            const fileReader = new FileReader('existing.txt', true);
            fileReader.buffer = mockDataBuffer;
            let data = '';

            fileReader.on('data', (chunk) => {
                data += chunk;
            });

            fileReader.on('end', () => {
                expect(data).to.equal(expectedData);
                done();
            });
        });
    });
});
