// MAPS API ENDPOINT ROUTES
// ===============================================

const express = require('express');
const boom = require('boom');
const db = require('../components/db');
const gmaps = require('../components/gmaps');
const router = express.Router();

const handleGetLocations = function (sqlQuery, req, res, next) {
  if (req.query.lat === undefined || req.query.long === undefined ||
    req.query.distance === undefined || req.query.limit === undefined) {
    return next(boom.badRequest('Missing Required Fields!'));
  }

  db.query(sqlQuery, function (err, rows, fields) {
    if (err) {
      return next(boom.badImplementation(err));
    }

    let result = gmaps.getNearbyLocations(req.query.lat, req.query.long, req.query.distance, req.query.limit, rows);
    res.status(200).send({
      result
    });
  });
};


/* GET GeoCode of a specified location using Google Maps GeoCode API */
router.get('/geoCode', function (req, res, next) {
  if (req.query.address === undefined) {
    return next(boom.badRequest('Parameter address must be specified!'));
  }

  gmaps.getGeoCode(req.query.address,
    function (response) {
      res.status(200).send({
        response
      });
    },
    function (err) {
      next(boom.badImplementation(err));
    });
});

/* GET Nearby articles from a specified lat long location within a certain distance */
router.get('/getNearbyArticles', function (req, res, next) {
  let sqlQuery = 'SELECT * FROM ebdb.NewsArticle';

  return handleGetLocations(sqlQuery, req, res, next);
});

/* GET Nearby Posts from a specified lat long location within a certain distance */
router.get('/getNearbyPosts', function (req, res, next) {
  let sqlQuery = 'SELECT * FROM ebdb.ImagePost WHERE approved=1';

  return handleGetLocations(sqlQuery, req, res, next);
});

/* GET Nearby Restaurants from a specified lat long location within a certain distance */
router.get('/getNearbyRestaurants', function (req, res, next) {
  let sqlQuery = `SELECT partner_name, partner_type, address_1, postal_code, phone_number, website, latitude, longitude  
                  FROM ebdb.Restaurant WHERE isValid=1`;

  return handleGetLocations(sqlQuery, req, res, next);
});

/* GET Nearby Events from a specified lat long location within a certain distance */
router.get('/getNearbyEvents', function (req, res, next) {
  let sqlQuery = `SELECT * FROM ebdb.Events`;

  return handleGetLocations(sqlQuery, req, res, next);
});

module.exports = router;