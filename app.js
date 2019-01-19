var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var db = require('./components/db');
var axios = require('./components/axios');

var app = express();

var fishBaseFaoAreasUrl = "https://fishbase.ropensci.org/faoareas/?limit=5000&AreaCode=67";
var fishBaseSpeciesUrl = "https://fishbase.ropensci.org/species/?limit=5000&offset=0";

// VIEW ENGINE SETUP
// ===============================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// API ENDPOINT ROUTES
// ===============================================
app.get('/api/featurecollection', function (req, res) {
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

//app.get('/api/newsarticle', function (req, res) {
//  db.query('SELECT * FROM ebdb.NewsArticle', function (err, rows, fields) {
//    if (!err) {
//      res.status(200).send({
//        NewsArticle: rows,
//      });
//    } else {
//      console.log('Error while performing Query.');
//    }
//  });
//});

app.get('/api/newsarticle', function (req, res) {
  if (req.query.category === undefined) {
    res.status(500).send("parameter must be specified!");
    return;
  }

  db.query("SELECT * FROM ebdb.NewsArticle WHERE category='" + req.query.category + "'", function (err, rows, fields) {
    if (!err) {
      res.status(200).send({NewsArticle: rows,});
    } else {
      console.log('Error while performing Query.');
    }
  });

  console.log('Processing /api/testing request');
});

app.get('/api/faoareas', function (req, res) {
  db.query('SELECT * FROM ebdb.FaoAreas', function (err, rows, fields) {
    if (!err) {
      res.status(200).send({FaoAreas: rows,});
    } else {
      console.log('Error while performing Query.');
    }
  });
});

app.get('/api/species', function (req, res) {
  db.query('SELECT * FROM ebdb.Species', function (err, rows, fields) {
    if (!err) {
      res.status(200).send({Species: rows,});
    } else {
      console.log('Error while performing Query.');
    }
  });
});


app.get('/api/listOfSpecies', function (req, res) {
  db.query(`SELECT sp.SpecCode, sp.Genus, sp.Species, sp.PicPreferredName, sp.FBname 
            FROM ebdb.FaoAreas AS fa
            INNER JOIN ebdb.Species AS sp ON fa.SpecCode = sp.SpecCode`, function (err, rows, fields) {
    if (!err) {
      res.status(200).send({List: rows,});
    } else {
      console.log('Error while performing Query.');
    }
  });
});

// DB ENDPOINT ROUTES
// ===============================================

app.get('/db/update/faoareas', function (req, res) {

  axios.getRequest(fishBaseFaoAreasUrl,
    function (response) {

      var jsonData = response.data;
      var values = [];

      for (var i = 0; i < jsonData.length; i++) {
        values.push([jsonData[i].autoctr, jsonData[i].AreaCode, jsonData[i].SpecCode, jsonData[i].StockCode,
        jsonData[i].Status, jsonData[i].Entered, jsonData[i].DateEntered,
        jsonData[i].Modified, jsonData[i].DateModified, jsonData[i].Expert,
        jsonData[i].DateChecked, jsonData[i].TS]);
      }

      //TODO: Need to figure out best way to store this long query
      const insertOrUpdateQuery = `INSERT INTO ebdb.FaoAreas (autoctr, AreaCode, SpecCode, StockCode, 
                                                              Status, Entered, DateEntered, Modified,
                                                              DateModified, Expert, DateChecked, TS) 
                                    VALUES ? ON DUPLICATE KEY UPDATE AreaCode = VALUES(AreaCode), SpecCode = VALUES(SpecCode),
                                                                     StockCode = VALUES(StockCode), Status = VALUES(Status),
                                                                     Entered = VALUES(Entered), DateEntered = VALUES(DateEntered),
                                                                     Modified = VALUES(Modified), DateModified = VALUES(DateModified),
                                                                     Expert = VALUES(Expert), DateChecked = VALUES(DateChecked),
                                                                     TS = VALUES(TS)`;

      db.query(insertOrUpdateQuery, [values], function (err, rows, fields) {
        if (!err) {
          console.log('Data are updated or inserted successfully');
          res.status(200).send('SUCCESS: Data are updated or inserted successfully');
        } else {
          console.log('Error while performing INSERT/UPDATE.');
          res.status(500).send(err);
        }
      });
    },
    function (errorMsg) {
      res.status(500).send(errorMsg);
    });
});


app.get('/db/update/species', function (req, res) {
  axios.getRequest(fishBaseSpeciesUrl,
    function (response) {

      var jsonData = response.data;
      var values = [];

      for (var i = 0; i < jsonData.length; i++) {
        values.push([jsonData[i].SpecCode, jsonData[i].Genus, jsonData[i].Species, jsonData[i].SpeciesRefNo,
        jsonData[i].Author, jsonData[i].FBname, jsonData[i].PicPreferredName,
        jsonData[i].FamCode, jsonData[i].Subfamily, jsonData[i].GenCode,
        jsonData[i].BodyShapeI, jsonData[i].Source, jsonData[i].TaxIssue,
        jsonData[i].Fresh, jsonData[i].Brack, jsonData[i].Saltwater, 
        jsonData[i].DemersPelag, jsonData[i].Amphibious, jsonData[i].AnaCat,
        jsonData[i].MigratRef, jsonData[i].Vulnerability, jsonData[i].Length,
        jsonData[i].LTypeMaxM, jsonData[i].MaxLengthRef, jsonData[i].Weight,
        jsonData[i].UsedforAquaculture, jsonData[i].LifeCycle, jsonData[i].UsedasBait,
        jsonData[i].Aquarium, jsonData[i].Dangerous, jsonData[i].Electrogenic,
        jsonData[i].Comments, jsonData[i].Entered, jsonData[i].DateEntered,
        jsonData[i].Modified, jsonData[i].DateModified, jsonData[i].Expert,
        jsonData[i].DateChecked, jsonData[i].TS]);
      }

      //TODO: Need to figure out best way to store this long query
      const insertOrUpdateQuery = `INSERT INTO ebdb.Species (SpecCode, Genus, Species, SpeciesRefNo, 
                                                              Author, FBname, PicPreferredName, FamCode,
                                                              Subfamily, GenCode, BodyShapeI, Source,
                                                              TaxIssue, Fresh, Brack, Saltwater,
                                                              DemersPelag, Amphibious, AnaCat, MigratRef,
                                                              Vulnerability, Length, LTypeMaxM, MaxLengthRef,
                                                              Weight, UsedforAquaculture, LifeCycle, UsedasBait,
                                                              Aquarium, Dangerous, Electrogenic, Comments,
                                                              Entered, DateEntered, Modified, DateModified,
                                                              Expert, DateChecked, TS) 
                                    VALUES ? ON DUPLICATE KEY UPDATE Genus = VALUES(Genus), Species = VALUES(Species),
                                                                     SpeciesRefNo = VALUES(SpeciesRefNo), Author = VALUES(Author),
                                                                     FBname = VALUES(FBname), PicPreferredName = VALUES(PicPreferredName),
                                                                     FamCode = VALUES(FamCode), Subfamily = VALUES(Subfamily),
                                                                     GenCode = VALUES(GenCode), BodyShapeI = VALUES(BodyShapeI),
                                                                     TaxIssue = VALUES(TaxIssue), Fresh = VALUES(Fresh),
                                                                     Brack = VALUES(Brack), Saltwater = VALUES(Saltwater),
                                                                     DemersPelag = VALUES(DemersPelag), Amphibious = VALUES(Amphibious),
                                                                     AnaCat = VALUES(AnaCat), MigratRef = VALUES(MigratRef),
                                                                     Vulnerability = VALUES(Vulnerability), Length = VALUES(Length),
                                                                     LTypeMaxM = VALUES(LTypeMaxM), MaxLengthRef = VALUES(MaxLengthRef),
                                                                     Weight = VALUES(Weight), UsedforAquaculture = VALUES(UsedforAquaculture),
                                                                     LifeCycle = VALUES(LifeCycle), UsedasBait = VALUES(UsedasBait),
                                                                     Aquarium = VALUES(Aquarium), Dangerous = VALUES(Dangerous),
                                                                     Electrogenic = VALUES(Electrogenic), Comments = VALUES(Comments),
                                                                     Entered = VALUES(Entered), DateEntered = VALUES(DateEntered),
                                                                     Modified = VALUES(Modified), DateModified = VALUES(DateModified),
                                                                     Expert = VALUES(Expert), DateChecked = VALUES(DateChecked),
                                                                     TS = VALUES(TS)`;

      db.query(insertOrUpdateQuery, [values], function (err, rows, fields) {
        if (!err) {
          console.log('Data are updated or inserted successfully');
          res.status(200).send('SUCCESS: Data are updated or inserted successfully');
        } else {
          console.log('Error while performing INSERT/UPDATE.');
          res.status(500).send(err);
        }
      });
    },
    function (errorMsg) {
      res.status(500).send(errorMsg);
    });

    });


  app.get('/db/disconnect', function (req, res) {
    db.end();
    console.log('Disconnected to database.');
  });


  // ERROR HANDLERS
  // =============================================== 
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  module.exports = app;
