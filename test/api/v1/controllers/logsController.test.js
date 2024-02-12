const chai = require('chai');
const chaiHttp = require('chai-http');
const httpStatus = require('http-status-codes');
const app = require('../../../../src/app');

chai.use(chaiHttp);
const { expect } = chai;

//happy path
describe('GET /api/v1/logs', () => {
    it('responds with text/html', (done) => {
        chai.request(app)
            .get('/api/v1/logs')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(httpStatus.OK);
                expect(res).to.be.html;
                done();
            });
    });
});
