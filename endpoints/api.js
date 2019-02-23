// API ENDPOINT ROUTES
// ===============================================

const express = require('express');
const db = require('../components/db');
const router = express.Router();

const auth = require('../auth/auth-firebase');

/* GET Feature Collection */
router.get('/featurecollection', auth.authenticate, function(req, res) {
    db.query('SELECT * FROM ebdb.FeatureCollection', function (err, rows, fields) {
        if (!err) {
          res.status(200).send({
            FeatureCollection: rows,
          });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
      });
  });

/* GET News Article */
router.get('/newsarticle', function (req, res) {
    if (req.query.category === undefined) return res.status(500).send("Parameter category must be specified!");

    var limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    var offset = (req.query.offset == undefined) ? 0 : req.query.offset;

    db.query("SELECT * FROM ebdb.NewsArticle WHERE category='" + req.query.category 
        + "'" + "ORDER BY published_at DESC LIMIT "+ limit +" OFFSET " + offset, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ NewsArticle: rows, });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});

/* GET FAO Areas NOTE: Currently only Area = 67 and Area = 21 which is West and East coast of Canada */
router.get('/faoareas', function (req, res) {
    db.query('SELECT * FROM ebdb.FaoAreas', function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ FaoAreas: rows, });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});

/* GET All Fish Species TODO: WILL BE REMOVE LATER*/
router.get('/species', function (req, res) {
    db.query('SELECT * FROM ebdb.Species', function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ Species: rows, });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});

/* GET details info of a fish species */
router.get('/speciesInfo', function (req, res) {
    if (req.query.specCode === undefined) return res.status(500).send("Parameter specCode must be specified!");

    db.query('SELECT * FROM ebdb.Species WHERE SpecCode = ' + req.query.specCode, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ SpeciesInfo: rows, });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});

/* GET A list of fish species NOTE: Currently only Area = 67 and Area = 21 which is West and East coast of Canada */
router.get('/listOfSpecies', function (req, res) {
    var limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    var offset = (req.query.offset == undefined) ? 0 : req.query.offset;
    var areaCode = (req.query.areaCode == undefined) ? 67 : req.query.areaCode;

    db.query(`SELECT sp.SpecCode, sp.Genus, sp.Species, sp.PicPreferredName, sp.FBname 
              FROM ebdb.FaoAreas AS fa
              INNER JOIN ebdb.Species AS sp ON fa.SpecCode = sp.SpecCode 
              WHERE fa.AreaCode = ?` +
              " LIMIT " + limit + " OFFSET " + offset, [areaCode], function (err, rows, fields) {
            if (!err) {
                res.status(200).send({ List: rows, });
            } else {
                console.log(err);
                res.status(500).send('Error while performing query. Please check your parameters');
            }
    });
});


/* GET Events */
router.get('/events', function (req, res) {
    if (req.query.city === undefined) return res.status(500).send("Parameter city must be specified!");

    var limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    var offset = (req.query.offset == undefined) ? 0 : req.query.offset;
  
    db.query('SELECT * FROM ebdb.Events WHERE city = ? ORDER BY startDate', [req.query.city], function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ Events: rows, });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});


/* GET A list of articles that matches the search keywords */
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

    var limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    var offset = (req.query.offset == undefined) ? 0 : req.query.offset;

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
    dbQueryCommand += " ORDER BY published_at DESC LIMIT "+ limit +" OFFSET " + offset;

    //send command to db
    db.query(dbQueryCommand, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ NewsArticle: rows, });
        } else {
            console.log('Error while performing Query.');
            res.status(500).send(err);
        }
    });
});


/* GET A list of fish that matches the search keywords */
//Note: Our SQL database is case insensitive for any string data
//Input
//search: string that has the search keywords
router.get('/fishSearch', function (req, res) {
    if (req.query.search === undefined) {
        res.status(500).send("'search' parameter must be specified!");
        return;
    }

    if (req.query.search == '') {
        //send empty array so that nothing in the FlatList gets rendered
        res.status(200).send({ List: [], });
        return;
    }

    var limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    var offset = (req.query.offset == undefined) ? 0 : req.query.offset;

    //NOTE: Still split on ' ' even though URL encoding represents space as '+'
    //Express automatically recognizes the '+' as being ' '
    var searchWordArr = req.query.search.split(' ');
    var dbQueryCommand = `SELECT DISTINCT sp.SpecCode, sp.Genus, sp.Species, sp.PicPreferredName, sp.FBname 
                          FROM ebdb.FaoAreas AS fa
                          INNER JOIN ebdb.Species AS sp ON fa.SpecCode = sp.SpecCode`;

    //generate SQL command
    for (var i = 0; i < searchWordArr.length; i++) {
        if (i == 0)
            dbQueryCommand += " WHERE";
        else
            dbQueryCommand += " OR";

        dbQueryCommand += ` sp.FBname LIKE '%${searchWordArr[i]}%'`;
        dbQueryCommand += ` OR sp.Genus LIKE '%${searchWordArr[i]}%'`;
        dbQueryCommand += ` OR sp.Species LIKE '%${searchWordArr[i]}%'`;
    }
    dbQueryCommand += " ORDER BY FBname LIMIT "+ limit +" OFFSET " + offset;

    //send command to db
    db.query(dbQueryCommand, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ List: rows, });
        } else {
            console.log('Error while performing Query.');
            res.status(500).send(err);
        }
    });
});

/* GET A list of events that matches the search keywords */
//Note: Our SQL database is case insensitive for any string data
//Input
//search: string that has the search keywords
router.get('/eventSearch', function (req, res) {
    if (req.query.search === undefined) {
        res.status(500).send("'search' parameter must be specified!");
        return;
    }

    if (req.query.search == '') {
        //send empty array so that nothing in the FlatList gets rendered
        res.status(200).send({ List: [], });
        return;
    }

    var limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    var offset = (req.query.offset == undefined) ? 0 : req.query.offset;

    //NOTE: Still split on ' ' even though URL encoding represents space as '+'
    //Express automatically recognizes the '+' as being ' '
    var searchWordArr = req.query.search.split(' ');
    var dbQueryCommand = `SELECT * FROM ebdb.Events`;

    //generate SQL command
    for (var i = 0; i < searchWordArr.length; i++) {
        if (i == 0)
            dbQueryCommand += " WHERE";
        else
            dbQueryCommand += " OR";

        dbQueryCommand += ` name LIKE '%${searchWordArr[i]}%'`;
        dbQueryCommand += ` OR description LIKE '%${searchWordArr[i]}%'`;
        dbQueryCommand += ` OR location LIKE '%${searchWordArr[i]}%'`;
        dbQueryCommand += ` OR city LIKE '%${searchWordArr[i]}%'`;
    }
    dbQueryCommand += " ORDER BY startDate LIMIT "+ limit +" OFFSET " + offset;

    //send command to db
    db.query(dbQueryCommand, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ List: rows, });
        } else {
            console.log('Error while performing Query.');
            res.status(500).send(err);
        }
    });
});


/* GET existing valid types of faoareas  */
router.get('/validFaoareas', function (req, res) {
  
    db.query('SELECT DISTINCT AreaCode FROM ebdb.FaoAreas', function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ ValidFaoAreas: rows, });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});


/* GET existing valid categories of news articles  */
router.get('/newsarticleCategories', function (req, res) {
  
    db.query('SELECT DISTINCT Category FROM ebdb.NewsArticle', function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ Categories: rows, });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});

/* GET all different cities of all existing events  */
router.get('/eventCities', function (req, res) {
  
    db.query('SELECT DISTINCT city FROM ebdb.Events', function (err, rows, fields) {
        if (!err) {
            res.status(200).send({ Cities: rows, });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});

module.exports = router;
