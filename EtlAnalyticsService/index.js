const express = require('express');
const queue = require('./queue');
const mongoDb = require('./mongo-db');

const app = express();
const port = process.env.PORT || 3301;

const rabbitMQUrl = `amqp://${process.env.RMQ_URL}:${process.env.MOD_CONTAINER_PORT}/`; //4101
const subscribeQueueAnalyze = process.env.AN_QUEUE_NAME;

async function consumeFromEtlAnalyzeQueue() {
    try {
        queue.consumeFromQueue(rabbitMQUrl, subscribeQueueAnalyze, async (message) => {
            await mongoDb.addNewLog({
                log: 'New Joke Insertion after the approval',
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