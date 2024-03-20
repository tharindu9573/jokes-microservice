const express = require('express'); 
const queue = require('./queue');
const jokesDb = require('./jokes-db')
const mongoDb = require('./mongo-db');

const app = express();
const port = 3301;

const rabbitMQUrl = `amqp://${process.env.RMQ_MODERATOR_URL}:4101/`;
const subscribeQueueAnalyze = 'etl_analyze_queue';

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
    consumeFromEtlAnalyzeQueue();
});