// MAPS API ENDPOINT ROUTES
// ===============================================

const express = require('express');
const db = require('../components/db');
const gmaps = require('../components/gmaps');
const router = express.Router();

/* GET GeoCode of a specified location using Google Maps GeoCode API */
router.get('/geoCode', function (req, res) {
    if (req.query.address === undefined) {
      res.status(500).send("Address must be specified!");
      return;
    }
 
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
     res.status(500).send("Missing Required Fields!");
     return;
   }
 
   db.query('SELECT * FROM ebdb.NewsArticle', function (err, rows, fields) {
     if (!err) {
       var result = gmaps.getNearbyLocations(req.query.lat, req.query.long, req.query.distance, req.query.limit, rows);
       res.status(200).send({ result });
     } else {
       console.log('Error while performing Query.');
     }
   });
 });

 module.exports = router;