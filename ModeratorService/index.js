const express = require('express');
const queue = require('./queue');
const db = require('./mysql-db')
const jwt = require('jsonwebtoken');
const path = require('path');
const axios = require('axios')
const cors = require('cors');
const fs = require('fs').promises;
const authenticateJWT = require('./middleware.js');

const rabbitMQUrl_Submitter = `amqp://${process.env.RMQ_SUBMITTER_URL}:${process.env.SM_CONTAINER_PORT}/`; //4201
const rabbitMQUrl_Moderator = `amqp://${process.env.RMQ_MODERATOR_URL}:${process.env.MOD_CONTAINER_PORT}/`; //4101
const subscribeQueue = process.env.SM_QUEUE_NAME;
const publishQueueApproved = process.env.MOD_QUEUE_NAME;
const publishQueueAnalyze = process.env.AN_QUEUE_NAME;

const port = process.env.PORT || 3100;

const app = express();

app.use(cors());

app.use('/moderator/index.html', express.static(path.join(__dirname, 'public')))

app.use(express.json());

app.get('/moderator', authenticateJWT, async (req, res) => {
    try {
        let result = await db.getAllJoke();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.get('/moderator/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        let result = await db.getJoke(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.delete('/moderator/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        let result = await db.deleteJoke(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.put('/moderator', authenticateJWT, async (req, res) => {
    try {
        let result = await db.updateJoke(req.body);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.patch('/moderator/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        let result = await db.approveJoke(id);
        let approvedMessage = await db.getJoke(id);
        await queue.sendToQueue(rabbitMQUrl_Moderator, publishQueueApproved, JSON.stringify(approvedMessage));
        await queue.sendToQueue(rabbitMQUrl_Moderator, publishQueueAnalyze, JSON.stringify(approvedMessage));
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.get('/moderator/types', async (req, res) => {
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

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
        const token = jwt.sign({ userId: username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.status(200).send(token);
    }
    else {
        res.status(401).send('Unauthorized');
    }
});

app.use((err, req, res, next) => {
    res.status(500).send('An error occurred. Please try again later.');
});

function consumeFromSubmitterQueue() {
    try {
        queue.consumeFromQueue(rabbitMQUrl_Submitter, subscribeQueue, async (message) => {
            const jsonMessage = JSON.parse(message);
            db.insertJoke(jsonMessage).then(result => {
                console.log(`Inserted to moderator jokes. result: ${result}`);
            }).catch(err => {
                console.log(err.message);
            });
        });
    } catch (error) {
        console.error('Error consuming messages from Submitter Queue:', error);
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
    consumeFromSubmitterQueue();
});