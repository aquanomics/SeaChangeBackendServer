// DEPRECATED!: AUTH ENDPOINTS CONTROLLER
// ===============================================
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');

const db = require('../components/db');

const verifyToken = require('./verify-token');

const cookieOptions = {
    httpOnly: true,
    expires: 0
};

const jwtTokenExpiration  = 86400; // expires in 24 hours

router.post('/register', function(req, res) {
  
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    db.query(`INSERT INTO ebdb.Auth (UserName, Password) VALUES (?, ?)`, [req.body.username, hashedPassword], function (err, rows, fields) {
        if (!err) {
            console.log('Data inserted successfully');
            res.status(200).send("User registered Succesfully");
        } else {
            console.log(err);
            res.status(500).send("There was a problem registering the user.");
        }
    });
});


router.get('/test', verifyToken, function (req, res) {
    res.status(200).send({ message: "SUCCESS!" });
});

router.post('/login', function(req, res) {
    db.query("SELECT * FROM ebdb.Auth WHERE UserName = ?" , [req.body.username], function (err, rows, fields) {
        if (!err) {
            if(rows.length === 0) res.status(404).send('No user found.');

            var passwordIsValid = bcrypt.compareSync(req.body.password, rows[0].Password);

            if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

            var token = jwt.sign({ id: rows[0].id }, config.secret, {
              expiresIn: jwtTokenExpiration
            });

            res.cookie('jwtToken', token, cookieOptions);
            res.status(200).send({ auth: true });
        } else {
            console.log('Error while performing Query.');
            res.status(500).send("Error on the server");
        }
    });
});


module.exports = router;