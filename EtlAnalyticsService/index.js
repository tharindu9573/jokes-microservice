const express = require('express');
const queue = require('./queue');
const mongoDb = require('./mongo-db');

const app = express();
const port = process.env.PORT || 3301;
const SERVICE_NAME = process.env.SERVICE_NAME;

const rabbitMQUrl = `amqp://${process.env.RMQ_URL}:${process.env.MOD_CONTAINER_PORT}/`; //4101
const subscribeQueueAnalytics = process.env.AN_QUEUE_NAME;

function consumeFromEtlAnalyticsQueue() {
    try {
        queue.consumeFromQueue(rabbitMQUrl, subscribeQueueAnalytics, async (message) => {
            const jsonMessage = JSON.parse(message)
            let { id, joke_text, punch_line, type_id, type_name, original_joke, moderator, is_changed, change_properties, start_time, end_time } = jsonMessage;
            console.log(`${SERVICE_NAME}, Received message from ${subscribeQueueAnalytics} Queue:`, message);

            mongoDb.addNewLog({
                joke_id: id,
                joke_type: type_name,
                is_changed: is_changed,
                change_properties: change_properties,
                submitted_joke: original_joke,
                moderated_joke: JSON.stringify({ joke_text, punch_line, type_id }),
                moderator: moderator,
                start_date_time: start_time,
                end_date_time: end_time,
                log: type_id == 0 ? 'Failed to create the new type in the moderate service' : 'Success',
                created_date_time: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error(`${SERVICE_NAME}, Error consuming messages from Etl Analytics Queue:`, error);
    }
}

app.listen(port, () => {
    console.log(`${SERVICE_NAME}, Server is running on port ${port}`);
    consumeFromEtlAnalyticsQueue();
});