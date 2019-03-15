// POST IMAGE API ENDPOINT ROUTES
// ===============================================

const express = require("express");
const router = express.Router();
const s3 = require('../components/aws-s3');
const db = require('../components/db');
const auth = require('../auth/auth-firebase');

const singleUpload = s3.single('image');

const handleDeleteImage = function (imageKey, res, msg) {

  s3.deleteImg(imageKey,
    function (response) {
      db.query('DELETE FROM ebdb.ImagePost WHERE imageKey= ?', [imageKey], function (err, result) {
        if (!err) {
          console.log('Deleted rows: ' + result.affectedRows);
          res.status(200).send({'action': msg.action, 'status': msg.status});
        } else {
          console.log(err);
          res.status(500).send('Current State: '+ msg.text + ', Status: Error while performing Query.');
        }
      });
    },
    function (errorMsg) {
      console.log(errorMsg);
      res.status(500).send(errorMsg);
    }); 
};

// TODO: Currently the post info is part of the http request query.
// Need to find a way to get Node.js to parse form-data body format. 
router.post('/image-upload', auth.authenticate, function(req, res) {

  if (req.query.name == undefined) return  res.status(400).send("Parameters or not specified properly");  

  singleUpload(req, res, function(err, some) {
    if (err || req.file == undefined) {
      return res.status(500).send({errors: [{title: 'Image Upload Error', detail: err.message}] });
    }

    var latitude = req.query.lat; 
    var longitude = req.query.long;

    if(latitude == 0 && longitude == 0) {
      latitude = null;
      longitude = null;
    }

    db.query(`INSERT INTO ebdb.ImagePost (name, comment, lat, lng, urlToImage, imageKey, uploaded_at, uid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.query.name, req.query.comment, latitude, longitude, req.file.location, req.file.key, new Date(), req.query.uid], 
      function (err, rows, fields) {
        if (!err) {
          return res.status(200).send({'imageUrl': req.file.location, 'key': req.file.key});
        } else {
          console.log(err);
          return handleDeleteImage(req.file.key, res, {'action': 'Rollback', 'status': 'Reverted image upload due to DB update fail'});
        }
    });
  });
});


/* DELETE an existing image from the DB and S3 */
router.delete('/image-delete', function(req, res) {

  if (req.query.imageKey == undefined || req.query.imageKey == '') return  res.status(400).send("Image Key is not specified!");

  return handleDeleteImage(req.query.imageKey, res, {'action': 'Delete', 'status': 'Deleted image as requested'});
});


/* PUT existing image approved to true  */
router.put('/image-approve', function(req, res) {

  if (req.query.imageKey == undefined || req.query.imageKey == '') return  res.status(400).send("Image Key is not specified!");

  db.query('UPDATE ebdb.ImagePost SET approved=1 WHERE imageKey= ?', [req.query.imageKey], function (err, rows, fields) {
    if (!err) {
        console.log('Image updated to approved');
        res.status(200).send('Image updated to approved');
    } else {
        console.log('Error while performing UPDATE');
        res.status(500).send(err);
    }
  });
});


module.exports = router;