const amqp = require('amqplib');
const SERVICE_NAME = process.env.SERVICE_NAME;

async function consumeFromQueue(rabbitMQUrl, subscribeQueue, callback) {
    try {
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(subscribeQueue, { durable: true });
        console.log(`${SERVICE_NAME}, Listing to ${subscribeQueue}. Waiting for messages...`);

        channel.consume(subscribeQueue, (message) => {
            if (message !== null) {
                console.log(`${SERVICE_NAME}, Received message from ${subscribeQueue} queue. Message: ${message.content.toString()}`);
                channel.ack(message);
                callback(message.content.toString());
            }
        });
    } catch (error) {
        console.error(`${SERVICE_NAME}, AMQP connection error:`, error.message);
        console.log(`${SERVICE_NAME}, Attempting to reconnect to AMQP...`);
        setTimeout(() => {
            consumeFromQueue(rabbitMQUrl, subscribeQueue, callback);
        }, 5000);
    }
}

module.exports = {
    consumeFromQueue
}