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
    let limit = (req.query.limit === undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;

    let sqlQuery = `SELECT * FROM ebdb.NewsArticle`; 

    if (req.query.category === undefined || req.query.category === 'All') {
        sqlQuery += ` ORDER BY published_at DESC LIMIT ` + limit + " OFFSET " + offset;
    } else {
        sqlQuery += ` WHERE category='` + req.query.category + "'" + "ORDER BY published_at DESC LIMIT " + limit + " OFFSET " + offset;
    }

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

    let sqlQuery = `SELECT sp.SpecCode, sp.Genus, sp.Species, sp.PicPreferredName, sp.FBname 
                    FROM ebdb.FaoAreas AS fa
                    INNER JOIN ebdb.Species AS sp ON fa.SpecCode = sp.SpecCode`; 
   
    if (req.query.areaCode === undefined || req.query.areaCode === 'All') {
        sqlQuery += " LIMIT " + limit + " OFFSET " + offset;
    } else {
        sqlQuery +=  ` WHERE fa.AreaCode = ?` + " LIMIT " + limit + " OFFSET " + offset;
    }

    db.query(sqlQuery, [req.query.areaCode], function (err, rows, fields) {
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
    let limit = (req.query.limit == undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset == undefined) ? 0 : req.query.offset;
    let sqlQuery = 'SELECT * FROM ebdb.Events'

    if (req.query.city === undefined || req.query.city === 'All') {
        sqlQuery += ' ORDER BY startDate' + ' LIMIT ' + limit + ' OFFSET ' + offset;
    } else {
        sqlQuery += ' WHERE city = ? ORDER BY startDate' + ' LIMIT ' + limit + ' OFFSET ' + offset;
    }

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


/* GET List of articles that matches the search keywords */
// Note: Our SQL database is case insensitive for any string data
// Input Search: string that has the search keywords
router.get('/articleSearch', function (req, res, next) {
    if (req.query.search === undefined) {
        return next(boom.badRequest('Parameter search must be specified!'));
    }

    if (req.query.search === '') {
        // Send empty array so that nothing in the FlatList gets rendered
        return res.status(200).send({
            NewsArticle: [],
        });
    }

    let limit = (req.query.limit === undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;

    //NOTE: Still split on ' ' even though URL encoding represents space as '+'
    // Express automatically recognizes the '+' as being ' '
    let searchWordArr = req.query.search.split(' ');
    let sqlQuery = "SELECT * FROM ebdb.NewsArticle";

    for (let i = 0; i < searchWordArr.length; i++) {
        if (i == 0) {
            sqlQuery += " WHERE";
        } else {
            sqlQuery += " AND";
        }

        sqlQuery += ` title LIKE '%${searchWordArr[i]}%'`;
    }

    sqlQuery += " ORDER BY published_at DESC LIMIT " + limit + " OFFSET " + offset;

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            NewsArticle: rows,
        });
    });
});


/* GET List of fish that matches the search keywords */
// Note: Our SQL database is case insensitive for any string data
// Input Search: string that has the search keywords
router.get('/fishSearch', function (req, res, next) {
    if (req.query.search === undefined) {
        return next(boom.badRequest('Parameter search must be specified!'));
    }

    if (req.query.search === '') {
        // Send empty array so that nothing in the FlatList gets rendered
        return res.status(200).send({
            List: [],
        });
    }

    let limit = (req.query.limit === undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;

    // NOTE: Still split on ' ' even though URL encoding represents space as '+'
    // Express automatically recognizes the '+' as being ' '
    let searchWordArr = req.query.search.split(' ');
    let sqlQuery = `SELECT DISTINCT sp.SpecCode, sp.Genus, sp.Species, sp.PicPreferredName, sp.FBname 
                          FROM ebdb.FaoAreas AS fa
                          INNER JOIN ebdb.Species AS sp ON fa.SpecCode = sp.SpecCode`;

    for (let i = 0; i < searchWordArr.length; i++) {
        if (i == 0) {
            sqlQuery += " WHERE";
        } else {
            sqlQuery += " OR";
        }

        sqlQuery += ` sp.FBname LIKE '%${searchWordArr[i]}%'`;
        sqlQuery += ` OR sp.Genus LIKE '%${searchWordArr[i]}%'`;
        sqlQuery += ` OR sp.Species LIKE '%${searchWordArr[i]}%'`;
    }

    sqlQuery += " ORDER BY FBname LIMIT " + limit + " OFFSET " + offset;

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            List: rows,
        });
    });
});

/* GET A list of events that matches the search keywords */
// Note: Our SQL database is case insensitive for any string data
// Input Search: string that has the search keywords
router.get('/eventSearch', function (req, res, next) {
    if (req.query.search === undefined) {
        return next(boom.badRequest('Parameter search must be specified!'));
    }

    if (req.query.search === '') {
        // Send empty array so that nothing in the FlatList gets rendered
        return res.status(200).send({
            List: [],
        });
    }

    let limit = (req.query.limit === undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;

    // NOTE: Still split on ' ' even though URL encoding represents space as '+'
    // Express automatically recognizes the '+' as being ' '
    let searchWordArr = req.query.search.split(' ');
    let sqlQuery = `SELECT * FROM ebdb.Events`;

    for (let i = 0; i < searchWordArr.length; i++) {
        if (i == 0) {
            sqlQuery += " WHERE";
        } else {
            sqlQuery += " OR";
        }

        sqlQuery += ` name LIKE '%${searchWordArr[i]}%'`;
        sqlQuery += ` OR description LIKE '%${searchWordArr[i]}%'`;
        sqlQuery += ` OR location LIKE '%${searchWordArr[i]}%'`;
        sqlQuery += ` OR city LIKE '%${searchWordArr[i]}%'`;
    }

    sqlQuery += " ORDER BY startDate LIMIT " + limit + " OFFSET " + offset;

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            List: rows,
        });
    });
});

/* GET A list of posts that matches the search keywords */
// Note: Our SQL database is case insensitive for any string data
// Input Search: string that has the search keywords
router.get('/postSearch', auth.authenticate, function (req, res, next) {
    if (req.query.search === undefined) {
        return next(boom.badRequest('Parameter search must be specified!'));
    }

    if (req.query.uid === undefined) {
        return next(boom.badRequest('Missing additional field!'));
    }

    if (req.query.search === '') {
        // Send empty array so that nothing in the FlatList gets rendered
        return res.status(200).send({
            List: [],
        });
    }

    let limit = (req.query.limit === undefined) ? 10 : req.query.limit;
    let offset = (req.query.offset === undefined) ? 0 : req.query.offset;

    // NOTE: Still split on ' ' even though URL encoding represents space as '+'
    // Express automatically recognizes the '+' as being ' '
    let searchWordArr = req.query.search.split(' ');
    let sqlQuery = `SELECT * FROM ebdb.ImagePost WHERE uid = "` + req.query.uid + '"';

    for (let i = 0; i < searchWordArr.length; i++) {
        if (i == 0) {
            sqlQuery += " AND (";
        } else {
            sqlQuery += " OR";
        }

        sqlQuery += ` name LIKE '%${searchWordArr[i]}%'`;
        sqlQuery += ` OR comment LIKE '%${searchWordArr[i]}%'`;
    }

    sqlQuery += ") ORDER BY uploaded_at DESC LIMIT " + limit + " OFFSET " + offset;

    db.query(sqlQuery, function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }

        res.status(200).send({
            List: rows,
        });
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