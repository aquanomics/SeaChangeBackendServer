// AUTH API FIREBASE
// ===============================================
const admin = require('firebase-admin');
const serviceAccount = require('../config');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount.firebase_admin),
});

module.exports.authenticate = function authenticate(req, res, next) {
    if (req.body.idToken == null && req.query.idToken == null) {
        return next(boom.badRequest('Missing authentication token id.'));
    }

    admin.auth().verifyIdToken(req.body.idToken || req.query.idToken)
        .then(function (decodedToken) {
            var uid = decodedToken.uid;
            next();
        }).catch(function (error) {
            res.status(401).send('Failed to authenticate token.');
        });
}

