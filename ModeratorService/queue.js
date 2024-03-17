const amqp = require('amqplib');

async function consumeFromQueue(rabbitMQUrl, subscribeQueue, callback) {
    try {
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(subscribeQueue, { durable: true });
        console.log('Waiting for messages...');

        channel.consume(subscribeQueue, (message) => {
            if (message !== null) {
                console.log(`Received message from submitter queue`);
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

async function sendToQueue(rabbitMQUrl, queueName, message) {
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`Message sent to queue: ${queueName}`);
    await channel.close();
    await connection.close();
}

module.exports = {
    consumeFromQueue,
    sendToQueue
}