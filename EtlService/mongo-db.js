const mongoose = require('mongoose');

const uri = 'mongodb://host.docker.internal:27017/logsanalyzedatabase';

function connectWithRetry() {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB:', err.message);
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
        console.log('Attempting to reconnect to MongoDB...');
        setTimeout(connectWithRetry, 5000);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB connection disconnected');
        console.log('Attempting to reconnect to MongoDB...');
        setTimeout(connectWithRetry, 5000);
    });
}

//connectWithRetry();

const schema = new mongoose.Schema({
    log: String,
    parameters: String,
    time: String
});

const Log = mongoose.model('Logs', schema);

async function addNewLog(log) {
    const newLog = new Log(log);
    console.log(newLog);
    await newLog.save();
}

module.exports = {
    addNewLog
}
