const express = require('express');
const jokeDb = require('./jokes-db');

const app = express();
const port = 4000;

app.use(express.json());

app.get('/jokes', async (req, res) => {
    try {
        let result = await jokeDb.getAllJoke();
        res.status(200).send(result);
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

app.get('/jokes/categories', async (req, res) => {
    try {
        let result = await jokeDb.getAllCategories();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.get('/jokes/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await jokeDb.getCategory(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.post('/jokes/categories', async (req, res) => {
    const category = req.body;
    try {
        let result = await jokeDb.insertCategory(category);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.put('/jokes/categories', async (req, res) => {
    const category = req.body;
    try {
        let result = await jokeDb.updateCategory(category);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.delete('/jokes/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let result = await jokeDb.deleteCategory(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(`An error occurred. Message: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

