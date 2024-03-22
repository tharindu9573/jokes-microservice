const jwt = require('express-jwt');

const authenticateJWT = jwt.expressjwt({
    secret: process.env.JWT_SECRET || 'secret',
    algorithms: ['HS256']
});

module.exports = authenticateJWT;