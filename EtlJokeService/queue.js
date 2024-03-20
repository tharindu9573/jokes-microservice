const amqp = require('amqplib');

async function consumeFromQueue(rabbitMQUrl, subscribeQueue, callback) {
    try {
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(subscribeQueue, { durable: true });
        console.log('Waiting for messages...');

        channel.consume(subscribeQueue, (message) => {
            if (message !== null) {
                console.log(`Received message from ${subscribeQueue} queue`);
                channel.ack(message);
                callback(message.content.toString());
            }
        });
    } catch (error) {
        console.error('AMQP connection error:', error.message);
        console.log('Attempting to reconnect to AMQP...');
        setTimeout(() => {
            consumeFromQueue(rabbitMQUrl, subscribeQueue, callback);
        }, 5000);
    }
}

module.exports = {
    consumeFromQueue
}