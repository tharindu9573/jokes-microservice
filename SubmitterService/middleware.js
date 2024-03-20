const jwt = require('express-jwt');
const secret = 'mysupersecret'

const authenticateJWT = jwt.expressjwt({
    secret: secret,
    algorithms: ['HS256']
});

module.exports = authenticateJWT;