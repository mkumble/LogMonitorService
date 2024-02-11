const chai = require('chai');
const chaiHttp = require('chai-http');
const httpStatus = require('http-status-codes');
const app = require('../../src/server/app');

chai.use(chaiHttp);
chai.should();

describe("GET /", () => {
    it("should return 'Hello, World!'", (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                res.should.have.status(httpStatus.OK);
                res.text.should.be.eql('Hello, World!');
                done();
            });
    });
});
