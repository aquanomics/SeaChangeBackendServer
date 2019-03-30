// API ENDPOINT ROUTES
// ===============================================

const express = require('express');
const boom = require('boom');
const db = require('../components/db');
const auth = require('../auth/auth-firebase');
const router = express.Router();

/* GET Feature Collection */
router.get('/featurecollection', function (req, res, next) {
    let sqlQuery = 'SELECT * FROM ebdb.FeatureCollection';

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            FeatureCollection: rows,
        });
    });
});

/* GET News Article */
router.get('/newsarticle', function (req, res, next) {
    if (req.query.category === undefined) {
        return next(boom.badRequest('Parameter category must be specified!'));
    }

    let limit = (req.query.limit === undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
    let sqlQuery = "SELECT * FROM ebdb.NewsArticle WHERE category='" + req.query.category + "'" 
                     + "ORDER BY published_at DESC LIMIT " + limit + " OFFSET " + offset;

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            NewsArticle: rows,
        });
    });
});

/* GET FAO Areas NOTE: Currently only Area = 67, Area = 21, and Area = 18 which are West, East coast of Canada and Artic */
router.get('/faoareas', function (req, res, next) {
    let sqlQuery = 'SELECT * FROM ebdb.FaoAreas';

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            FaoAreas: rows,
        });
    });
});

/* GET All Fish Species TODO: WILL BE REMOVE LATER*/
router.get('/species', function (req, res) {
    db.query('SELECT * FROM ebdb.Species', function (err, rows, fields) {
        if (!err) {
            res.status(200).send({
                Species: rows,
            });
        } else {
            console.log(err);
            res.status(500).send('Error while performing Query.');
        }
    });
});

/* GET details info of a fish species */
router.get('/speciesInfo', function (req, res, next) {
    if (req.query.specCode === undefined) {
        return next(boom.badRequest('Parameter specCode must be specified!'));
    }

    let sqlQuery = 'SELECT * FROM ebdb.Species WHERE SpecCode = ' + req.query.specCode;

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            SpeciesInfo: rows,
        });
    });
});

/* GET A list of fish species NOTE: Currently only Area = 67, Area = 21, and Area = 18 which are West, East coast of Canada and Artic */
router.get('/listOfSpecies', function (req, res, next) {
    let limit = (req.query.limit === undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
    let areaCode = (req.query.areaCode === undefined) ? 67 : req.query.areaCode;
    let sqlQuery = `SELECT sp.SpecCode, sp.Genus, sp.Species, sp.PicPreferredName, sp.FBname 
                    FROM ebdb.FaoAreas AS fa
                    INNER JOIN ebdb.Species AS sp ON fa.SpecCode = sp.SpecCode 
                    WHERE fa.AreaCode = ?` +
                    " LIMIT " + limit + " OFFSET " + offset;

    db.query(sqlQuery, [areaCode], function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            List: rows,
        });
    });
});


/* GET Events */
router.get('/events', function (req, res, next) {
    if (req.query.city === undefined) {
        return next(boom.badRequest('Parameter city must be specified!'));
    }

    let limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset == undefined) ? 0 : req.query.offset;
    let sqlQuery = 'SELECT * FROM ebdb.Events WHERE city = ? ORDER BY startDate' +
                   " LIMIT " + limit + " OFFSET " + offset;

    db.query(sqlQuery, [req.query.city], function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            Events: rows,
        });
    });
});


/* GET User's Posts */
router.get('/posts', auth.authenticate, function (req, res, next) {
    if (req.query.uid === undefined) {
        return next(boom.badRequest('Parameter uid must be specified!'));
    }

    let limit = (req.query.limit === undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;
    let sqlQuery = 'SELECT * FROM ebdb.ImagePost WHERE uid = ? ORDER BY uploaded_at' +
                   " LIMIT " + limit + " OFFSET " + offset;

    db.query(sqlQuery, [req.query.uid], function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            Posts: rows,
        });
    });
});

/* GET User data */
router.get('/user', auth.authenticate, function (req, res, next) {
    if (req.query.uid === undefined) {
        return next(boom.badRequest('Parameter uid must be specified!'));
    }

    let sqlQuery =' SELECT * FROM ebdb.Users WHERE uid = ?';

    db.query(sqlQuery, [req.query.uid], function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            User: rows,
        });
    });
});


/* GET A list of articles that matches the search keywords */
//Note: Our SQL database is case insensitive for any string data
//Input
//search: string that has the search keywords
router.get('/articleSearch', function (req, res) {
    if (req.query.search === undefined) {
        return res.status(400).send("'search' parameter must be specified!");
    }

    if (req.query.search == '') {
        //send empty array so that nothing in the FlatList gets rendered
        return res.status(200).send({
            NewsArticle: [],
        });
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
    dbQueryCommand += " ORDER BY published_at DESC LIMIT " + limit + " OFFSET " + offset;

    //send command to db
    db.query(dbQueryCommand, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({
                NewsArticle: rows,
            });
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
        return res.status(400).send("'search' parameter must be specified!");
    }

    if (req.query.search == '') {
        //send empty array so that nothing in the FlatList gets rendered
        return res.status(200).send({
            List: [],
        });
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
    dbQueryCommand += " ORDER BY FBname LIMIT " + limit + " OFFSET " + offset;

    //send command to db
    db.query(dbQueryCommand, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({
                List: rows,
            });
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
        return res.status(400).send("'search' parameter must be specified!");
    }

    if (req.query.search == '') {
        //send empty array so that nothing in the FlatList gets rendered
        return res.status(200).send({
            List: [],
        });
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
    dbQueryCommand += " ORDER BY startDate LIMIT " + limit + " OFFSET " + offset;

    //send command to db
    db.query(dbQueryCommand, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({
                List: rows,
            });
        } else {
            console.log('Error while performing Query.');
            res.status(500).send(err);
        }
    });
});

/* GET A list of posts that matches the search keywords */
//Note: Our SQL database is case insensitive for any string data
//Input
//search: string that has the search keywords
router.get('/postSearch', auth.authenticate, function (req, res) {
    if (req.query.search === undefined) {
        return res.status(400).send("'search' parameter must be specified!");
    }

    if (req.query.uid === undefined) {
        return res.status(400).send("Missing additional field!");
    }

    if (req.query.search == '') {
        //send empty array so that nothing in the FlatList gets rendered
        return res.status(200).send({
            List: [],
        });
    }

    var limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    var offset = (req.query.offset == undefined) ? 0 : req.query.offset;

    //NOTE: Still split on ' ' even though URL encoding represents space as '+'
    //Express automatically recognizes the '+' as being ' '
    var searchWordArr = req.query.search.split(' ');
    var dbQueryCommand = `SELECT * FROM ebdb.ImagePost WHERE uid = "` + req.query.uid + '"';

    //generate SQL command
    for (var i = 0; i < searchWordArr.length; i++) {
        if (i == 0)
            dbQueryCommand += " AND";
        else
            dbQueryCommand += " OR";

        dbQueryCommand += ` name LIKE '%${searchWordArr[i]}%'`;
        dbQueryCommand += ` OR comment LIKE '%${searchWordArr[i]}%'`;
    }
    dbQueryCommand += " ORDER BY uploaded_at LIMIT " + limit + " OFFSET " + offset;

    //send command to db
    db.query(dbQueryCommand, function (err, rows, fields) {
        if (!err) {
            res.status(200).send({
                List: rows,
            });
        } else {
            console.log('Error while performing Query.');
            res.status(500).send(err);
        }
    });
});


/* GET existing valid types of faoareas  */
router.get('/validFaoareas', function (req, res) {
    let sqlQuery = 'SELECT DISTINCT AreaCode FROM ebdb.FaoAreas';

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            ValidFaoAreas: rows,
        });
    });
});

/* GET existing valid categories of news articles  */
router.get('/newsarticleCategories', function (req, res, next) {
    let sqlQuery = 'SELECT DISTINCT Category FROM ebdb.NewsArticle';

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            Categories: rows,
        });
    });
});

/* GET all different cities of all existing events  */
router.get('/eventCities', function (req, res, next) {
    let sqlQuery = 'SELECT DISTINCT city FROM ebdb.Events';

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }
        
        res.status(200).send({
            Cities: rows,
        });
    });
});

module.exports = router;