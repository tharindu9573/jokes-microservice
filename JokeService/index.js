const express = require('express');
const jokeDb = require('./mysql-db');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/jokes/index.html', express.static(path.join(__dirname, 'public')))

app.use(express.json());

//jokes endpoints
app.get('/jokes', async (req, res) => {
    const { type, count } = req.query;
    try {
        if (type && count) {
            let result = await jokeDb.getJokeByTypeAndCount(type, count);
            res.status(200).send(result);
        } else if (type) {
            let result = await jokeDb.getJokeByType(type);
            res.status(200).send(result);
        }
        else if (count) {
            let result = await jokeDb.getJokeByCount(count);
            res.status(200).send(result);
        } else {
            let result = await jokeDb.getAllJoke();
            res.status(200).send(result);
        }

    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.get('/jokes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await jokeDb.getJoke(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.post('/jokes', async (req, res) => {
    const joke = req.body;
    try {
        let result = await jokeDb.insertJoke(joke);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.put('/jokes', async (req, res) => {
    const joke = req.body;
    try {
        let result = await jokeDb.updateJoke(joke);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.delete('/jokes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await jokeDb.deleteJoke(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.get('/jokes/types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await jokeDb.getJokeByTypeId(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});


// types endpoints
app.get('/types', async (req, res) => {
    try {
        let result = await jokeDb.getAllTypes();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.get('/types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await jokeDb.getType(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.post('/types', async (req, res) => {
    const type = req.body;
    try {
        let result = await jokeDb.insertType(type);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.put('/types', async (req, res) => {
    const type = req.body;
    try {
        let result = await jokeDb.updateType(type);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.delete('/types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await jokeDb.deleteType(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

