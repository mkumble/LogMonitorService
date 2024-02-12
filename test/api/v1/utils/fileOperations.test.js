const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const stream = require('stream');
const expect = chai.expect;

const fileOperations = require('../../../../src/api/utils/fileOperations');

describe('readFileInReverse', () => {
    let createReadStreamMock;

    beforeEach(() => {
        createReadStreamMock = sinon.stub(fs, 'createReadStream');
        sinon.stub(fs, 'existsSync').returns(true);
    });

    afterEach(() => {
        sinon.restore();
    });

    async function testReadFileInReverse(mockData, numEntries, keyword) {
        const expectedData = mockData.split('\n').filter(Boolean).reverse().slice(0, numEntries).join('\n');
        const readableStream = new stream.Readable({
            read() {
                this.push(mockData);
                this.push(null);
            }
        });
        createReadStreamMock.returns(readableStream);

        const data = await fileOperations.readFileInReverse('filePath', numEntries, keyword);
        expect(data).to.equal(expectedData);
        if (keyword) {
            expect(data.includes(keyword)).to.be.true;
        }
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
        const mockData = 'line1 \n keyword line2 \n keyword line3';
        const numEntries = 2;
        const keyword = 'keyword';
        const expectedData = mockData.split('\n').filter(line => line.includes(keyword)).reverse().slice(0, numEntries).join('\n');
        const readableStream = new stream.Readable({
            read() {
                this.push(mockData);
                this.push(null);
            }
        });
        createReadStreamMock.returns(readableStream);

        const data = await fileOperations.readFileInReverse('filePath', numEntries, keyword);
        expect(data).to.equal(expectedData);
    });

    //error
    it('throws an error if reading the file fails', async () => {
        const mockError = new Error('error');
        createReadStreamMock.throws(mockError);

        try {
            await fileOperations.readFileInReverse('filePath', 2, null);
        } catch (err) {
            expect(err).to.equal(mockError);
        }
    });
});
