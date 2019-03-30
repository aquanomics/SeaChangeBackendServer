const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const apiEndpoints = require('./endpoints/api');
const mapEndpoints = require('./endpoints/map');
const dbEndpoints = require('./endpoints/db');
const postImgEndpoints = require('./endpoints/post-img');
const postArticleEndpoints = require('./endpoints/post-article');
const usersEndpoints = require('./endpoints/users');

const authController = require('./auth/auth-controller');

const app = express();

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

// AUTH CONTROLLER 
// ===============================================
app.use('/api/auth', authController);

// API ENDPOINTS SETUP
// ===============================================
app.use('/api', apiEndpoints);
app.use('/map', mapEndpoints);
app.use('/db', dbEndpoints);
app.use('/post-img', postImgEndpoints);
app.use('/post-article', postArticleEndpoints);
app.use('/users', usersEndpoints);

// ERROR HANDLERS
// =============================================== 
// Main http error handler
app.use(function (err, req, res, next) {
  if (err.isServer) {
    console.log(err);
  }

  if (err.output === undefined) {
    return next(createError(404));
  }

  return res.status(err.output.statusCode).json(err.output.payload);
});

module.exports = app;
