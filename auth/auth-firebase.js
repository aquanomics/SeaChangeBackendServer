// AUTH API FIREBASE
// ===============================================
const admin = require('firebase-admin');
const serviceAccount = require('../config');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount.firebase_admin),
});

module.exports.authenticate = function authenticate (req, res, next) {

    if (req.body.idToken == null) return res.status(500).send('Missing authentication token id.');

    admin.auth().verifyIdToken(req.body.idToken)
        .then(function(decodedToken) {
            console.log(decodedToken);
            var uid = decodedToken.uid;
            console.log("Token uid is: " + uid);
            next();
        }).catch(function(error) {
            res.status(500).send('Failed to authenticate token.');
        });
}

