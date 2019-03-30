// POST ARTICLE API ENDPOINT ROUTES
// ===============================================

const express = require("express");
const boom = require('boom');
const db = require('../components/db');
const auth = require('../auth/auth-firebase');
const router = express.Router();

router.post('/article-upload', auth.authenticate, function(req, res, next) {
    if (req.body.url === undefined || req.body.description === undefined) {
        return next(boom.badRequest('Request Body is not set properly'));
    }

    let sqlQuery = `INSERT INTO ebdb.NewsArticlePost (url, description, uploaded_at, uid) VALUES (?, ?, ?, ?)`;

    db.query(sqlQuery, [req.body.url, req.body.description, new Date(), req.body.uid], function (err, rows, fields) {
        if (err) {
            return next(boom.badImplementation(err));
        }
        
        return res.status(200).send('Article successfully uploaded!');
    });
});

module.exports = router;