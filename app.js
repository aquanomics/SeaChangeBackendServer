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
      res.status(200).send({
        NewsArticle: rows,
      });
    } else {
      console.log('Error while performing Query.');
    }
  });

  console.log('Processing /api/testing request');
});

app.get('/api/faoareas', function (req, res) {
  db.query('SELECT * FROM ebdb.FaoAreas', function (err, rows, fields) {
    if (!err) {
      res.status(200).send(rows);
    } else {
      console.log('Error while performing Query.');
    }
  });
});

// DB ENDPOINT ROUTES
// ===============================================

app.get('/db/update', function (req, res) {

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
