process.env.NODE_ENV = 'test';

const app = require('../../app');

const sinon = require('sinon');

//Chai dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const auth = require('../../auth/auth-firebase');

//TODO: CURRENTLY DISABLE API TEST WITH FIREBASE AUTH MIDDLEWARE
// beforeEach(function() {
//   sinon.stub(auth, 'authenticate')
//       .callsFake(function(req, res, next) {
//          next();
//       });

//   // after you can create app:
//   app = require('../../app');
// });

// afterEach(function() {
//   // restore original method
//   auth.authenticate.restore();
// });

/*
  * Test /GET Feature Collection route
  */
//  describe('/GET feature collections', () => {
//     it('should GET all the feature collections from the DB', (done) => {
//       sinon.stub(auth, 'authenticate')
//       .callsFake(function(req, res, next) {
//          next();
//       });

//       clearRequire.all();
//       app = require('../../app');

//       chai.request(app)
//           .get('/api/featurecollection')
//           .end((err, res) => {
//                 console.log(res.error.text);
//                 res.should.have.status(200);
//                 res.body.should.be.a('object');
//                 res.body.FeatureCollection.should.be.a('array');
//                 auth.authenticate.restore();
//             done();
//           });
//     });
// });

/*
  * Test /GET News Article route
  */
 describe('/GET newsarticle', () => {
  it('should GET news articles with the specified category from the DB', (done) => {
    chai.request(app)
        .get('/api/newsarticle?category=Canada')
        .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.NewsArticle.should.be.a('array');
          done();
        });
  });

  it('should return error status 400 if category is not specified', (done) => {
    chai.request(app)
        .get('/api/newsarticle')
        .end((err, res) => {
              res.should.have.status(400);
              expect(res.error.text).to.equal("Parameter category must be specified!");
          done();
        });
  });
});

/*
  * Test /GET FAO Areas route
  */
 describe('/GET FAO Areas information', () => {
  it('should GET all the FAO Areas info from the DB (CURRENTLY DB ONLY CONTAIN INFO FROM FAO CODE 67)', (done) => {
    chai.request(app)
        .get('/api/faoareas')
        .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.FaoAreas.should.be.a('array');
          done();
        });
  });
});

/*
  * Test /GET Species Info route
  */
 describe('/GET details info of a fish species', () => {
  it('should GET details info of a fish species with the specified spec code from the DB', (done) => {
    chai.request(app)
        .get('/api/speciesInfo?specCode=9')
        .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.SpeciesInfo.should.be.a('array');
          done();
        });
  });

  it('should return error status 400 if spec code is not specified', (done) => {
    chai.request(app)
        .get('/api/speciesInfo')
        .end((err, res) => {
              res.should.have.status(400);
              expect(res.error.text).to.equal("Parameter specCode must be specified!");
          done();
        });
  });
});

/*
  * Test /GET List of Species route
  */
 describe('/GET a list of fish species', () => {
  it('should GET a list of fish species from the DB', (done) => {
    chai.request(app)
        .get('/api/listOfSpecies')
        .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.List.should.be.a('array');
          done();
        });
  });
});

/*
  * Test /GET Events route
  */
 describe('/GET a list of events', () => {
  it('should GET a list of events from the DB', (done) => {
    chai.request(app)
        .get('/api/events?city=Vancouver')
        .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.Events.should.be.a('array');
          done();
        });
  });
});

/*
  * TODO: Test /GET Article Search route
  */
 describe('TODO: Test /GET a list of articles that matches the search keywords', () => {});