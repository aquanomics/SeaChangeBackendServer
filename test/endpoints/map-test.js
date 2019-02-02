process.env.NODE_ENV = 'test';

const app = require('../../app');

//Chai dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

/*
  * Test /GET Nearby Articles route
  */
 describe('/GET nearby articles', () => {
    it('should GET the info of nearby articles based on the specified parameters from the DB', (done) => {
      chai.request(app)
          .get('/map/getNearbyArticles?lat=49.190077&long=-123.103008&distance=100&limit=5')
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.result.should.be.a('array');
            done();
          });
    });

    it('should return error status 500 if any one of the parameter fields is not specified', (done) => {
        chai.request(app)
            .get('/map/getNearbyArticles?lat=49.190077&long=-123.103008&distance=100')
            .end((err, res) => {
                  res.should.have.status(500);
                  expect(res.error.text).to.equal("Missing Required Fields!");
              done();
            });
      });
});

/*
  * Test /GET  GeoCode route 
  */
 describe('/GET geocode', () => {
    it('should GET the geocode location of a specified location using Google Maps GeoCode API', (done) => {
      chai.request(app)
          .get('/map/geoCode?address=2329 West Mall, Vancouver, BC')
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.response.should.be.a('array');
            done();
          });
    });

    it('should return error status 500 if the address parameter is not specified', (done) => {
        chai.request(app)
            .get('/map/geoCode')
            .end((err, res) => {
                  res.should.have.status(500);
                  expect(res.error.text).to.equal("Address must be specified!");
              done();
            });
      });
});
