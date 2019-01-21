var jwt = require('jsonwebtoken');
var config = require('../config');

function verifyToken(req, res, next) {
  const userJwt = req.cookies.jwtToken;
  if (!userJwt)
    return res.status(401).send({ auth: false, message: 'Missing authorization token.' });

  jwt.verify(userJwt, config.secret, function(err, decoded) {
    if (err) {
      res.clearCookie('jwtToken');
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
    req.userId = decoded.id;
    next();
  });
}
module.exports = verifyToken;