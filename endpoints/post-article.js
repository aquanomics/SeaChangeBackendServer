// POST ARTICLE API ENDPOINT ROUTES
// ===============================================

const express = require("express");
const router = express.Router();
const db = require('../components/db');

router.post('/article-upload', function(req, res) {

    if (req.body.url == undefined || req.body.description == undefined) return  res.status(500).send("Request Body is not set properly");

    db.query(`INSERT INTO ebdb.NewsArticlePost (url, description, uploaded_at) VALUES (?, ?, ?)`,
        [req.body.url, req.body.description, new Date()], 
        function (err, rows, fields) {
        if (!err) {
            return res.status(200).send('Article successfully uploaded!');
        } else {
            console.log(err);
            res.status(500).send("There was a problem registering the user.");
        }
    });
});

module.exports = router;