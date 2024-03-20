const express = require('express');
const app = express();
const amqp = require('amqplib');

const port = 3200;

const rabbitMQUrl = `amqp://${process.env.BASE_URL}:4201/`;;
const queueName = 'submitter_queue';

app.use(express.json());

app.post('/submit', (req, res) => {
    try {
        var { category_id, joke_text } = req.body;
        var jsonMessage = JSON.stringify({ category_id, joke_text });
        sendToQueue(jsonMessage);
        res.status(201).send("Joke was submitted");
    } catch (error) {
        res.status(500).send(`An error was occured while submitting the joke. Error: ${error.message}`);
    }
});

async function sendToQueue(message) {
    try {
        const connection = await amqp.connect(rabbitMQUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        await channel.sendToQueue(queueName, Buffer.from(message));
        console.log(`Message sent to queue: ${message}`);
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending message to RabbitMQ:', error);
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
});