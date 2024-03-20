const mongoose = require('mongoose');

const uri = `mongodb://root:example@${process.env.BASE_URL}:4302/`;

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

async function getAllLogs() {
    return await Log.find({});
}

module.exports = {
    getAllLogs
}