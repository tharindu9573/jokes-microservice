const express = require('express');
const queue = require('./queue');
const db = require('./mysql-db')
const jwt = require('jsonwebtoken');
const path = require('path');
const axios = require('axios')
const cors = require('cors');
const fs = require('fs').promises;
const middleware = require('./middleware.js');

const GW_URL = `http://${process.env.GW_URL}:${process.env.GW_PORT}`; // 80
const rabbitMQUrl_Submit = `amqp://${process.env.RMQ_SUBMIT_URL}:${process.env.SM_CONTAINER_PORT}/`; //4201
const rabbitMQUrl_Moderate = `amqp://${process.env.RMQ_MODERATE_URL}:${process.env.MOD_CONTAINER_PORT}/`; //4101
const subscribeQueue = process.env.SM_QUEUE_NAME;
const publishQueueApproved = process.env.MOD_QUEUE_NAME;
const publishQueueAnalytics = process.env.AN_QUEUE_NAME;
const SERVICE_NAME = process.env.SERVICE_NAME;

const port = process.env.PORT || 3100;

const app = express();

app.use(cors());

app.use('/moderate', express.static(path.join(__dirname, 'public')))
app.use('/moderate/index.html', express.static(path.join(__dirname, 'public')))

app.use(express.json());

// app.get('/moderate', authenticateJWT, async (req, res) => {
//     try {
//         let result = await db.getAllJoke();
//         res.status(200).send(result);
//     } catch (error) {
//         res.status(500).send(`An error occurred. Message: ${error.message}`);
//     }
// });

app.get('/moderate/unapproved', middleware.extractJwtClaims, middleware.authenticateJWT, async (req, res) => {
    try {
        let result = await db.getUnapprovedJoke();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.post('/moderate/approve', middleware.extractJwtClaims, middleware.authenticateJWT, async (req, res) => {
    try {
        let moderator = req.claims.userId;
        let { id, joke_text, punch_line, type_id, type_name, original_joke, is_changed, change_properties, start_time, end_time } = req.body;

        if (type_id == 0) {
            type_id = await addType(type_name);
        }

        let approvedMessage = { type_id, joke_text, punch_line, type_name };
        await queue.sendToQueue(rabbitMQUrl_Moderate, publishQueueApproved, JSON.stringify(approvedMessage));

        let analyticsMessage = { id, joke_text, punch_line, type_id, type_name, original_joke, moderator, is_changed, change_properties, start_time, end_time };
        await queue.sendToQueue(rabbitMQUrl_Moderate, publishQueueAnalytics, JSON.stringify(analyticsMessage));

        let result = await db.approveJoke(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

// app.get('/moderate/:id',  middleware.extractJwtClaims, async (req, res) => {
//     try {
//         const { id } = req.params;
//         let result = await db.getJoke(id);
//         res.status(200).send(result);
//     } catch (error) {
//         res.status(500).send(`An error occurred. Message: ${error.message}`);
//     }
// });

app.delete('/moderate/:id', middleware.extractJwtClaims, middleware.authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        let result = await db.deleteJoke(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

// app.put('/moderate',  middleware.extractJwtClaims, async (req, res) => {
//     try {
//         let result = await db.updateJoke(req.body);
//         res.status(200).send(result);
//     } catch (error) {
//         res.status(500).send(`An error occurred. Message: ${error.message}`);
//     }
// });

// app.patch('/moderate/:id',  middleware.extractJwtClaims, async (req, res) => {
//     try {
//         const { id } = req.params;
//         let result = await db.approveJoke(id);
//         let approvedMessage = await db.getJoke(id);
//         await queue.sendToQueue(rabbitMQUrl_Moderate, publishQueueApproved, JSON.stringify(approvedMessage));
//         await queue.sendToQueue(rabbitMQUrl_Moderate, publishQueueAnalytics, JSON.stringify(approvedMessage));
//         res.status(200).send(result);
//     } catch (error) {
//         res.status(500).send(`An error occurred. Message: ${error.message}`);
//     }
// });

app.get('/moderate/types', middleware.extractJwtClaims, middleware.authenticateJWT, async (req, res) => {
    try {
        const response = await axios.get(`${GW_URL}/types`)
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
    if (username === (process.env.USERNAME || 'admin') && password === (process.env.PASSWORD || 'diamondback')) {
        const token = jwt.sign({ userId: username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.status(200).send({ "token": token });
    }
    else {
        res.status(401).send('Unauthorized');
    }
});

app.use((err, req, res, next) => {
    if (err.message.toLowerCase().includes('jwt'))
        return res.status(401).send(err.message);
    return res.status(500).send(`An error occurred. Please try again later. Error: ${err.message}`);
});

async function consumeFromSubmitQueue() {
    try {
        queue.consumeFromQueue(rabbitMQUrl_Submit, subscribeQueue, async (message) => {
            const jsonMessage = JSON.parse(message);
            await insertJoke(jsonMessage);
        });
    } catch (error) {
        console.error(`${SERVICE_NAME}, Error consuming messages from Submit Queue:`, error);
    }
}

async function insertJoke(jsonMessage) {
    try {
        await jokesDb.insertJoke(jsonMessage);
        console.log(`${SERVICE_NAME}, Inserted to moderate jokes table. result: ${JSON.stringify(result)}`);
    } catch (error) {
        console.error(`${SERVICE_NAME}, Error inserting joke:`, error);
        setTimeout(() => { insertJoke(jsonMessage), 10 * 1000 });
    }
}

function writeToFile(data) {
    const filePth = path.join(__dirname, 'backup', 'types.json');
    fs.writeFile(filePth, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error(`${SERVICE_NAME}, Error writing file: `, err);
        }
    });
}

async function readFromFile() {
    const filePath = path.join(__dirname, 'backup', 'types.json');
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`${SERVICE_NAME}, Error reading file: `, err);
        return [];
    }
}

async function addType(type) {
    try {
        const response = await axios.post(`${GW_URL}/types`, { name: type })
        return await response.data.insertId;
    } catch (error) {
        console.error(`${SERVICE_NAME}, Error adding type: `, error);
        return 0;
    }
}

app.listen(port, () => {
    console.log(`${SERVICE_NAME}, Server is running on port ${port}`);
    consumeFromSubmitQueue();
});