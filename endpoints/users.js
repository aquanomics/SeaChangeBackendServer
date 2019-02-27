// USERS ENDPOINT ROUTES
// ===============================================

const express = require('express');
const router = express.Router();
const db = require('../components/db');
const auth = require('../auth/auth-firebase');

/* POST a new created firebase user to the DB */
router.post('/register', auth.authenticate, function(req, res) {

    if (req.body.uid == undefined || req.body.username == undefined) return  res.status(400).send("Request Body is not set properly");
  
    db.query(`INSERT INTO ebdb.Users (uid, username, created_at) VALUES (?, ?, ?)`,
        [req.body.uid, req.body.username, new Date()], 
        function (err, rows, fields) {
          if (!err) {
            return res.status(200).send('User successfully registered');
          } else {
            console.log(err);
            res.status(500).send('There was a problem registering the user');
          }
    });
});

/* POST a new created firebase user to the DB */
//TODO: Secure this endpoint with pass
router.get('/checkUsername', function(req, res) {

    //if (req.body.pass != '') return  res.status(500).send("Unauthorized");
    if (req.query.username == undefined) return  res.status(400).send("Error unspecify username");
  
    db.query(`SELECT username FROM ebdb.Users WHERE username = ?`, [req.query.username], function (err, rows, fields) {
          if (!err) {
            return res.status(200).send({ Users: rows, });
          } else {
            console.log(err);
            res.status(500).send('There was a problem fetching existing usernames');
          }
    });
});

module.exports = router;