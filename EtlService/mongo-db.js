const mongoose = require('mongoose');

const uri = 'mongodb://root:example@mongo:27017/';

setTimeout(() => {
    mongoose.connect(uri)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => console.error('Error connecting to MongoDB:', err));
}, 45*1000);

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
