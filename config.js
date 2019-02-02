const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    'db': {
        "host": process.env.DB_HOST,
        "user": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "port": process.env.DB_PORT
    },
    'aws': {
        "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
        "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
        "region": process.env.AWS_REGION
    },
    'gmapsKey': {
        "key": process.env.GMAPS_KEY, // Key from Capstone28SeaChange@gmail.com
        "Promise": Promise
    },
    'secret': process.env.AUTH_SECRET,
    'aws_s3': {
        "bucket_name": process.env.AWS_S3_BUCKET_NAME
    },
};