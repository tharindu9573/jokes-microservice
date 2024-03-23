const express = require('express');
const queue = require('./queue');
const jokesDb = require('./jokes-db')

const app = express();
const port = process.env.PORT || 3001;
const SERVICE_NAME = process.env.SERVICE_NAME;

const rabbitMQUrl = `amqp://${process.env.RMQ_URL}:${process.env.MOD_CONTAINER_PORT}/`; //4101
const subscribeQueueApproved = process.env.MOD_QUEUE_NAME;

async function consumeFromEtlApprovedQueue() {
    try {
        queue.consumeFromQueue(rabbitMQUrl, subscribeQueueApproved, async (message) => {
            const jsonMessage = JSON.parse(message);
            console.log(`${SERVICE_NAME}, Received message from Etl Approved Queue After phrase:`, jsonMessage);
            await insertJoke(jsonMessage);
        });
    } catch (error) {
        console.error(`${SERVICE_NAME}, Error consuming messages from Etl Approved Queue:`, error);
    }
}

async function insertJoke(jsonMessage) {
    try {
        await jokesDb.insertJoke(jsonMessage);
    } catch (error) {
        console.error(`${SERVICE_NAME}, Error inserting joke:`, error);
        setTimeout(() => { insertJoke(jsonMessage), 10 * 1000 });
    }
}

app.listen(port, () => {
    console.log(`${SERVICE_NAME}, Server is running on port ${port}`);
    consumeFromEtlApprovedQueue();
});