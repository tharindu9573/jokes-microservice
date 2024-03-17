const express = require('express'); 
const queue = require('./queue');
const jokesDb = require('./jokes-db')
const mongoDb = require('./mongo-db');

const app = express();
const port = 3000;

const rabbitMQUrl = 'amqp://host.docker.internal:5672/';
const subscribeQueueApproved = 'etl_approved_queue';
const subscribeQueueAnalyze = 'etl_analyze_queue';

async function consumeFromEtlApprovedQueue() {
    try {
        queue.consumeFromQueue(rabbitMQUrl, subscribeQueueApproved, async (message) => {
            const jsonMessage = JSON.parse(message);
            await jokesDb.insertJoke(jsonMessage);
        });
    } catch (error) {
        console.error('Error consuming messages from Etl Approved Queue:', error);
    }
}

async function consumeFromEtlAnalyzeQueue() {
    try {
        queue.consumeFromQueue(rabbitMQUrl, subscribeQueueAnalyze, async (message) => {
            await mongoDb.addNewLog({
                log: 'New Joke Insertion after the approvel',
                parameters: message,
                time: new Date().getTime()
            })
        });
    } catch (error) {
        console.error('Error consuming messages from Etl Analyze Queue:', error);
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    consumeFromEtlApprovedQueue();
    consumeFromEtlAnalyzeQueue();
});