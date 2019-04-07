// POST IMAGE API ENDPOINT ROUTES
// ===============================================

const express = require("express");
const boom = require('boom');
const s3 = require('../components/aws-s3');
const db = require('../components/db');
const auth = require('../auth/auth-firebase');
const router = express.Router();

const singleUpload = s3.single('image');

const handleDeleteImage = function (imageKey, res, msg) {

  s3.deleteImg(imageKey,
    function (response) {
      db.query('DELETE FROM ebdb.ImagePost WHERE imageKey= ?', [imageKey], function (err, result) {
        if (err) {
          console.log(err);
          res.status(500).send('Current State: ' + msg.text + ', Status: Error while performing Query.');
        }

        console.log('Deleted rows: ' + result.affectedRows);
        res.status(200).send({
          'action': msg.action,
          'status': msg.status
        });
      });
    },
    function (err) {
      next(boom.badImplementation(err));
    }); 
};

/* POST an image data to the DB and S3 */
router.post('/image-upload', auth.authenticate, function(req, res, next) {
  if (req.query.name === undefined) {
    return next(boom.badRequest('Parameters or not specified properly')); 
  }

  singleUpload(req, res, function(err, some) {
    if (err || req.file === undefined) {
      return res.status(500).send({errors: [{title: 'Image Upload Error', detail: err.message}] });
    }

    let latitude = req.query.lat; 
    let longitude = req.query.lng;

    if (latitude == 0 && longitude == 0) {
      latitude = null;
      longitude = null;
    }

    let sqlQuery = `INSERT INTO ebdb.ImagePost (name, comment, lat, lng, urlToImage, imageKey, uploaded_at, uid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; 

    db.query(sqlQuery, [req.query.name, req.query.comment, latitude, longitude, req.file.location, req.file.key, new Date(), req.query.uid],
      function (err, rows, fields) {
        if (err) {
          console.log(err);
          return handleDeleteImage(req.file.key, res, {
            'action': 'Rollback',
            'status': 'Reverted image upload due to DB update fail'
          });
        }

        res.status(200).send({
          'imageUrl': req.file.location,
          'key': req.file.key
        });
      });
  });
});

/* DELETE an existing image from the DB and S3 */
router.delete('/image-delete', function(req, res, next) {
  if (req.query.imageKey === undefined || req.query.imageKey === '') {
    return next(boom.badRequest('Image Key is not specified!'));
  }

  return handleDeleteImage(req.query.imageKey, res, {
    'action': 'Delete',
    'status': 'Deleted image as requested'
  });
});

/* PUT existing image approved to true  */
router.put('/image-approve', function(req, res, next) {
  if (req.query.imageKey === undefined || req.query.imageKey === '') {
    return next(boom.badRequest('Image Key is not specified!'));
  }

  let sqlQuery = 'UPDATE ebdb.ImagePost SET approved=1 WHERE imageKey= ?';

  db.query(sqlQuery, [req.query.imageKey], function (err, rows, fields) {
    if (err) {
      return next(boom.badImplementation(err));
    }

    res.status(200).send('Image updated to approved');
  });
});

module.exports = router;