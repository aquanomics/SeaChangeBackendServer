// AWS S3 BUCKET CONNECTION SETUP
// ===============================================

const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const  connection_settings = require('../config');

aws.config.update(connection_settings.aws);

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 's3-post-bucket',
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, req.query.name + "-" + Date.now().toString() + ".png")
      }
    })
});
  
module.exports = upload;