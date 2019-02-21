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
    'firebase_admin': {
        "type": process.env.FIRE_TYPE,
        "project_id": process.env.FIRE_PROJECT_ID,
        "private_key_id": process.env.FIRE_PRIVATE_KEY_ID,
        "private_key": process.env.FIRE_PRIVATE_KEY,
        "client_email": process.env.FIRE_CLIENT_EMAIL,
        "client_id": process.env.FIRE_CLIENT_ID,
        "auth_uri": process.env.FIRE_AUTH_URI,
        "token_uri": process.env.FIRE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.FIRE_AUTH_PROVIDER_x509_CERT_URL,
        "client_x509_cert_url": process.env.FIRE_CLIENT_X509_CERT_URL
    },
};