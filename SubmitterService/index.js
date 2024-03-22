const express = require('express');
const app = express();
const amqp = require('amqplib');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger.js');
const path = require('path');
const axios = require('axios')
const cors = require('cors');
const fs = require('fs').promises;

const GW_URL = `http://${process.env.GW_URL}:${process.env.GW_PROT}`; // 80
const rabbitMQUrl = `amqp://${process.env.BASE_URL}:${process.env.SM_CONTAINER_PORT}/`; //4201
const queueName = process.env.SM_QUEUE_NAME;
const port = process.env.PORT || 3200;

app.use(cors());

app.use('/submit', express.static(path.join(__dirname, 'public')))
app.use('/submit/index.html', express.static(path.join(__dirname, 'public')))

app.use('/submit/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());

/**
 * @swagger
 * /submit:
 *   post:
 *     summary: Submits a new joke
 *     description: Accepts a joke with a type, text, and punchline, then queues it for processing.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type_id:
 *                 type: integer
 *                 example: 0
 *                 description: The ID of the joke type
 *               joke_text:
 *                 type: string
 *                 example: "string"
 *                 description: The main text of the joke
 *               punch_line:
 *                 type: string
 *                 example: "string"
 *                 description: The punch line of the joke
 *     responses:
 *       '201':
 *         description: Joke was submitted
 *       '500':
 *         description: An error occurred while submitting the joke
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "An error was occurred while submitting the joke. Error: Error details"
 */
app.post('/submit', (req, res) => {
    try {
        let { type_id, joke_text, punch_line } = req.body;
        let jsonMessage = JSON.stringify({ type_id, joke_text, punch_line });
        sendToQueue(jsonMessage);
        res.status(201).send("Joke was submitted");
    } catch (error) {
        res.status(500).send(`An error was occurred while submitting the joke. Error: ${error.message}`);
    }
});

/**
 * @swagger
 * /submit/types:
 *   get:
 *     summary: Retrieves joke types
 *     description: Fetches joke types from an external service, or from a local file as a fallback.
 *     responses:
 *       '200':
 *         description: A JSON array of joke types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JokeType'
 *       '500':
 *         description: Error message indicating the failure of retrieving joke types
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 * components:
 *   schemas:
 *     JokeType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 0
 *           description: Unique identifier for the joke type
 *         name:
 *           type: string
 *           example: "string"
 *           description: Name of the joke type
 *         is_deleted:
 *           type: boolean
 *           example: false
 *           description: Indicates whether the joke type is deleted (0 for false, 1 for true)
 */
app.get('/submit/types', async (req, res) => {
    try {
        const response = await axios.get(`${GW_URL}/type`)
        writeToFile(response.data);
        res.status(200).send(await response.data);
    } catch (error) {
        const types = await readFromFile();

        if (types.length > 0) {
            res.status(200).send(types);
        } else {
            res.status(500).send(`An error was occurred while retrieving types. Error: ${error.message}`);
        }
    }
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

function writeToFile(data) {
    const filePth = path.join(__dirname, 'backup', 'types.json');
    fs.writeFile(filePth, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
        }
    });
}

async function readFromFile() {
    const filePath = path.join(__dirname, 'backup', 'types.json');
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});