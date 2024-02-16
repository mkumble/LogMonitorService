const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const stream = require('stream');
const expect = chai.expect;

const fileOperations = require('../../../../src/api/utils/fileOperations');
const {FileDoesNotExistError} = require("../../../../src/api/errors/errorClasses");
const httpStatus = require("http-status-codes");

describe('readFileInReverse', () => {
        let createReadStreamMock;

        beforeEach(() => {
            createReadStreamMock = sinon.stub(fs, 'createReadStream');
            sinon.stub(fs, 'existsSync').returns(true);
        });

        afterEach(() => {
            sinon.restore();
        });

        function getExpectedData(mockData, numEntries, keyword) {
            let mockDataCopy = mockData.split('\n');

            while (mockDataCopy.length > 0 && mockDataCopy[mockDataCopy.length - 1].trim() === '') {
                mockDataCopy.pop();
            }
            if (keyword) {
                mockDataCopy = mockDataCopy.filter(line => line.includes(keyword));
            }
            if (numEntries) {
                mockDataCopy = mockDataCopy.slice(-numEntries);
            }
            mockDataCopy = mockDataCopy.reverse();

            // Join the lines into a single string with newline characters
            return '\n' + (mockDataCopy.join('\n'));
        }

        async function testReadFileInReverse(mockData, numEntries, keyword) {
            const expectedData = getExpectedData(mockData, numEntries, keyword);
            const readableStream = new stream.Readable({
                read() {
                    this.push(mockData);
                    this.push(null);
                }
            });
            createReadStreamMock.returns(readableStream);

            const logsStream = await fileOperations.readFileInReverse('filePath', numEntries, keyword);

            let data = '';
            for await (const chunk of logsStream) {
                data += "\n" + chunk;
            }

            expect(data).to.equal(expectedData);
        }

//happy path
        it('returns the last n entries when numEntries matches the number of entries in the log file', async () => {
            await testReadFileInReverse('line1 \n line2 \n line3', 3, null);
        });

        it('skips the last line if it is empty', async () => {
            await testReadFileInReverse('line1 \n line2 \n', 1, null);
        });

        it('returns the last n entries when numEntries is less than the number of entries in the log file', async () => {
            await testReadFileInReverse('line1 \n line2 \n line3', 2, null);
        });

        it('returns all entries when numEntries is greater than the number of entries in the log file', async () => {
            await testReadFileInReverse('line1 \n line2 \n line3', 4, null);
        });

        it('returns the last n entries containing the keyword when numEntries matches the number of entries in the log file', async () => {
            await testReadFileInReverse('line1 \n line2 \n line3', 3, 'line');
        });

        it('returns the last n entries containing the keyword when numEntries is less than the number of entries containing the keyword in the log file', async () => {
            await testReadFileInReverse('keyword line1 \n keyword line2 \n keyword line3', 2, 'keyword');
        });

        //error
        it('throws an error if reading the file fails', async function () {
            const filePath = 'non_existent_file.log';
            const numEntries = 10;
            const keyword = 'test';

            fs.existsSync.restore();
            sinon.stub(fs, 'existsSync').returns(false);

            try {
                await fileOperations.readFileInReverse(filePath, numEntries, keyword);
            } catch (err) {
                expect(err).to.be.an.instanceof(FileDoesNotExistError);
            }
        });
    }
)
;