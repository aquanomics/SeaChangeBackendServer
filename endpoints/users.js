// USERS ENDPOINT ROUTES
// ===============================================

const express = require('express');
const boom = require('boom');
const db = require('../components/db');
const auth = require('../auth/auth-firebase');
const router = express.Router();

/* POST a new created firebase user to the DB */
router.post('/register', auth.authenticate, function (req, res, next) {
  if (req.body.uid === undefined || req.body.username === undefined) {
    return next(boom.badRequest('Request Body is not set properly'));
  }

  let sqlQuery = `INSERT INTO ebdb.Users (uid, username, created_at) VALUES (?, ?, ?)`;

  db.query(sqlQuery, [req.body.uid, req.body.username, new Date()], function (err, rows, fields) {
    if (err) {
      return next(boom.badImplementation(err));
    }

    res.status(200).send('User successfully registered');
  });
});

/* POST a new created firebase user to the DB */
//TODO: Secure this endpoint with pass ?
router.get('/checkUsername', function (req, res, next) {
  if (req.query.username == undefined) {
    return next(boom.badRequest('Error unspecified username'));
  }

  let sqlQuery = `SELECT username FROM ebdb.Users WHERE username = ?`;

  db.query(sqlQuery, [req.query.username], function (err, rows, fields) {
    if (err) {
      return next(boom.badImplementation(err));
    }

    res.status(200).send({
      Users: rows,
    });
  });
});

module.exports = router;