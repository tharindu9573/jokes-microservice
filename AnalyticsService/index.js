const express = require('express');
const mongoDb = require('./mongo-db');

const app = express();
const port = process.env.PORT || 3300;

app.get('/logs', (req, res) => {
    try {
        mongoDb.getAllLogs().then(logs => {
            res.status(200).send(logs);
        }).catch(err => {
            res.status(500).send(err);
        });
    } catch (error) {
        res.status(500).send("Error occurred while getting the logs");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});