// MAPS API ENDPOINT ROUTES
// ===============================================

const express = require('express');
const db = require('../components/db');
const gmaps = require('../components/gmaps');
const router = express.Router();

/* GET GeoCode of a specified location using Google Maps GeoCode API */
router.get('/geoCode', function (req, res) {
    if (req.query.address === undefined) return res.status(500).send("Address must be specified!");
  
    gmaps.getGeoCode(req.query.address,
      function (response) {
        res.status(200).send({ response });
      },
      function (errorMsg) {
        res.status(500).send(errorMsg);
      });
 });
 
 /* GET Nearby articles from a specified lat long location within a certain distance */
 router.get('/getNearbyArticles', function (req, res) {
 
   if (req.query.lat == undefined || req.query.long == undefined 
       || req.query.distance == undefined || req.query.limit == undefined) {
     return res.status(500).send("Missing Required Fields!");
   }
 
   db.query('SELECT * FROM ebdb.NewsArticle', function (err, rows, fields) {
     if (!err) {
       var result = gmaps.getNearbyLocations(req.query.lat, req.query.long, req.query.distance, req.query.limit, rows);
       res.status(200).send({ result });
     } else {
       console.log(err);
       res.status(500).send('Error while performing Query.');
     }
   });
 });

  /* GET Nearby Posts from a specified lat long location within a certain distance */
  router.get('/getNearbyPosts', function (req, res) {
 
    if (req.query.lat == undefined || req.query.long == undefined 
        || req.query.distance == undefined || req.query.limit == undefined) {
      return res.status(500).send("Missing Required Fields!");
    }
  
    db.query('SELECT * FROM ebdb.ImagePost', function (err, rows, fields) {
      if (!err) {
        var result = gmaps.getNearbyLocations(req.query.lat, req.query.long, req.query.distance, req.query.limit, rows);
        res.status(200).send({ result });
      } else {
        console.log(err);
        res.status(500).send('Error while performing Query.');
      }
    });
  });

 module.exports = router;