// API ENDPOINT ROUTES
// ===============================================

const express = require('express');
const db = require('../components/db');
const router = express.Router();

/* GET Feature Collection */
router.get('/featurecollection', function(req, res) {
    db.query('SELECT * FROM ebdb.FeatureCollection', function (err, rows, fields) {
        if (!err) {
          res.status(200).send({
            FeatureCollection: rows,
          });
        } else {
          console.log('Error while performing Query.');
        }
      });
  });

/* GET News Article */
router.get('/newsarticle', function (req, res) {
    if (req.query.category === undefined) {
        res.status(500).send("parameter must be specified!");
        return;
    }

    db.query("SELECT * FROM ebdb.NewsArticle WHERE category='" + req.query.category + "'", function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ NewsArticle: rows, });
        } else {
            console.log('Error while performing Query.');
        }
    });

    console.log('Processing /api/testing request');
});

/* GET FAO Areas NOTE: Currently only Area = 67 which is West coast of Canada */
router.get('/faoareas', function (req, res) {
    db.query('SELECT * FROM ebdb.FaoAreas', function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ FaoAreas: rows, });
        } else {
            console.log('Error while performing Query.');
        }
    });
});

/* GET All Fish Species */
router.get('/species', function (req, res) {
    db.query('SELECT * FROM ebdb.Species', function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ Species: rows, });
        } else {
            console.log('Error while performing Query.');
        }
    });
});

/* GET A list of fish species NOTE: Currently only Area = 67 which is West coast of Canada */
router.get('/listOfSpecies', function (req, res) {
    db.query(`SELECT sp.SpecCode, sp.Genus, sp.Species, sp.PicPreferredName, sp.FBname 
              FROM ebdb.FaoAreas AS fa
              INNER JOIN ebdb.Species AS sp ON fa.SpecCode = sp.SpecCode`, function (err, rows, fields) {
            if (!err) {
                res.status(200).send({ List: rows, });
            } else {
                console.log('Error while performing Query.');
            }
        });
});


//Note: Our SQL database is case insensitive for any string data
//Input
//search: string that has the search keywords
router.get('/articleSearch', function (req, res) {
    if (req.query.search === undefined) {
        res.status(500).send("'search' parameter must be specified!");
        return;
    }

    if (req.query.search == '') {
        //send empty array so that nothing in the FlatList gets rendered
        res.status(200).send({ NewsArticle: [], });
        return;
    }

    //NOTE: Still split on ' ' even though URL encoding represents space as '+'
    //Express automatically recognizes the '+' as being ' '
    var searchWordArr = req.query.search.split(' ');
    var dbQueryCommand = "SELECT * FROM ebdb.NewsArticle";

    //generate SQL command
    for (var i = 0; i < searchWordArr.length; i++) {
        if (i == 0)
            dbQueryCommand += " WHERE";
        else
            dbQueryCommand += " AND";

        dbQueryCommand += ` title LIKE '%${searchWordArr[i]}%'`;
    }

    //send command to db
    db.query(dbQueryCommand, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ NewsArticle: rows, });
        } else {
            console.log('Error while performing Query.');
            res.status(500).send(err);
        }
    });

    console.log('Finished processing /api/articleSearch request');
});

module.exports = router;