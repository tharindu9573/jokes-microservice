const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express API with Swagger',
            version: '1.0.0',
            description: 'API documentation generated with Swagger',
        },
    },
    apis: ['./*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
