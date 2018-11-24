var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var db = require('./components/db');

var app = express();

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

app.get('/api/newsarticle', function (req, res) {
  db.query('SELECT * FROM ebdb.NewsArticle', function (err, rows, fields) {
    if (!err) {
      res.status(200).send({
        NewsArticle: rows,
      });
    } else {
      console.log('Error while performing Query.');
    }
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
