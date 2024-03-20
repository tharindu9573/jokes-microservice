const express = require('express');
const app = express();
const amqp = require('amqplib');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger.js');
const authenticateJWT = require('./middleware.js');
const jwt = require('jsonwebtoken');

const port = 3200;

const rabbitMQUrl = `amqp://${process.env.BASE_URL}:4201/`;;
const queueName = 'submitter_queue';
const secret = 'mysupersecret'

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());

/**
 * @swagger
 * /submit:
 *   post:
 *     summary: Submit new Joke
 *     tags: [Joke]
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             type_id:
 *               type: number
 *             joke_text:
 *               type: string
 *             punch_line:
 *               type: string 
 *     responses:
 *       200:
 *         description: New joke was submitted
 */
app.post('/submit', authenticateJWT, (req, res) => {
    try {
        var { type_id, joke_text, punch_line  } = req.body;
        var jsonMessage = JSON.stringify({ type_id, joke_text, punch_line  });
        sendToQueue(jsonMessage);
        res.status(201).send("Joke was submitted");
    } catch (error) {
        res.status(500).send(`An error was occured while submitting the joke. Error: ${error.message}`);
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string 
 *     responses:
 *       200:
 *         description: Authenticated
 */
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    if(username === process.env.USERNAME && password === process.env.PASSWORD){
        const token = jwt.sign({ userId: username }, secret, { expiresIn: '1h' });
        res.status(200).send(token);
    }
    else{
        res.status(401).send('Unauthorized');
    }
});

app.use((err, req, res, next) => {
    res.status(500).send('An error occurred. Please try again later.');
});

async function sendToQueue(message) {
    try {
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        await channel.sendToQueue(queueName, Buffer.from(message));
        console.log(`Message sent to queue: ${message}`);
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending message to RabbitMQ:', error);
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
});