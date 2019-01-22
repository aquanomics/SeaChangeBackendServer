// POST IMAGE API ENDPOINT ROUTES
// ===============================================

const express = require("express");
const router = express.Router();
const upload = require('../components/aws-s3');
const db = require('../components/db');

const singleUpload = upload.single('image')

// TODO: Currently the post info is part of the http request query.
// Need to find a way to get Node.js to parse form-data body format. 
router.post('/image-upload', function(req, res) {

  if (req.query.name == undefined || req.query.comment == undefined) 
    return  res.status(500).send("Parameters or not specified properly");

  singleUpload(req, res, function(err, some) {
    if (err || req.file == undefined) {
      return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}] });
    }

    db.query(`INSERT INTO ebdb.ImagePost (name, comment, lat, lng, urlToImage) VALUES (?, ?, ?, ?, ?)`,
      [req.query.name, req.query.comment, req.query.lat, req.query.long, req.file.location], function (err, rows, fields) {
        if (!err) {
          return res.status(200).send({'imageUrl': req.file.location});
        } else {
          console.log(err);
          res.status(500).send("There was a problem registering the user.");
        }
    });
  });
});

module.exports = router;