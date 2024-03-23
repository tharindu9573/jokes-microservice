const jwt = require('express-jwt');

const authenticateJWT = jwt.expressjwt({
  secret: process.env.JWT_SECRET || 'secret',
  algorithms: ['HS256']
});


function extractJwtClaims(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).send('Authorization header is missing');
  }

  try {
    const token = authorizationHeader.split(' ')[1];
    const claims = parseJwt(token);
    req.claims = claims;
    next();
  } catch (error) {
    return res.status(401).send('Invalid or expired token');
  }
}

function parseJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('JWT token must have 3 parts');
  }
  const payload = parts[1];
  const decodedPayload = Buffer.from(payload, 'base64url').toString();
  const claims = JSON.parse(decodedPayload);
  return claims;
}


module.exports = {
  authenticateJWT,
  extractJwtClaims
};