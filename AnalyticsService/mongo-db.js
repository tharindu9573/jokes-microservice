const mongoose = require('mongoose');
const SERVICE_NAME = process.env.SERVICE_NAME;

const MONGO_URL = `mongodb://root:${process.env.MONGO_ROOT_PASSWORD}@${process.env.BASE_URL}:${process.env.MONGO_CONTAINER_PORT}/`; //4302

const schema = new mongoose.Schema({
    joke_id: Number,
    joke_type: String,
    is_changed: Boolean,
    change_properties: String,
    submitted_joke: String,
    moderated_joke: String,
    moderator: String,
    start_date_time: String,
    end_date_time: String,
    log: String,
    created_date_time: String
});

const Log = mongoose.model('Logs', schema);

function connectDb() {
    try {
        setTimeout(() => {
            mongoose.connect(MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
                .then(() => console.log(`${SERVICE_NAME}, Connected to MongoDB`))
                .catch((err) => console.error(`${SERVICE_NAME}, Error connecting to MongoDB:`, err));
        }, 50 * 1000);

    }
    catch (error) {
        console.error(`${SERVICE_NAME}, Error connecting to MongoDB:`, error);
        console.log(`${SERVICE_NAME}, Attempting to reconnect to MongoDB...`);
        connectDb();
    }

}

connectDb();

async function getAllLogs() {
    try {
        const logs = await Log.find({});
        console.log("${SERVICE_NAME}, Retrieved logs:", logs);
        return logs;
    } catch (err) {
        console.error("${SERVICE_NAME}, Error retrieving logs:", err);
        return [];
    }
}

module.exports = {
    getAllLogs
}
