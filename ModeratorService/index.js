const express = require('express'); 
const queue = require('./queue');
const db = require('./jokes-db')

const app = express();
const port = 2000;

const rabbitMQUrl = 'amqp://52.142.45.4:5672/';
const subscribeQueue = 'submitter_queue';
const publishQueueApproved = 'etl_approved_queue';
const publishQueueAnalyze = 'etl_analyze_queue';

app.use(express.json());

app.get('/moderator', async (req, res) => {
    try {
        let result = await db.getAllJoke();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }   
});

app.get('/moderator/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result = await db.getJoke(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }   
});

app.delete('/moderator/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result = await db.deleteJoke(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }   
});

app.put('/moderator', async (req, res) => {
    try {
        let result = await db.updateJoke(req.body);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }   
});

app.patch('/moderator/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result = await db.approveJoke(id);
        var approvedMessage = await db.getJoke(id);
        await queue.sendToQueue(rabbitMQUrl, publishQueueApproved, JSON.stringify(approvedMessage));
        await queue.sendToQueue(rabbitMQUrl, publishQueueAnalyze, JSON.stringify(approvedMessage));
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }   
});

function consumeFromSubmitterQueue() {
    try {
        queue.consumeFromQueue(rabbitMQUrl, subscribeQueue, async (message) => {
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    consumeFromSubmitterQueue();
});