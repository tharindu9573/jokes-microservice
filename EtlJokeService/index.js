const express = require('express');
const queue = require('./queue');
const jokesDb = require('./jokes-db')

const app = express();
const port = process.env.PORT;

const rabbitMQUrl = `amqp://${process.env.RMQ_URL}:${process.env.MOD_CONTAINER_PORT}/`; //4101
const subscribeQueueApproved = process.env.MOD_QUEUE_NAME; 

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    consumeFromEtlApprovedQueue();
});