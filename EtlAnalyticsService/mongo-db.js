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

function addNewLog(log) {
    const newLog = new Log({
        joke_id: log.joke_id,
        joke_type: log.joke_type,
        is_changed: log.is_changed,
        change_properties: log.change_properties,
        submitted_joke: log.submitted_joke,
        moderated_joke: log.moderated_joke,
        moderator: log.moderator,
        start_date_time: log.start_date_time,
        end_date_time: log.end_date_time,
        log: log.log,
        created_date_time: log.created_date_time
    });
    newLog.save()
        .then(() => console.log(`${SERVICE_NAME}, Log saved to MongoDB`))
        .catch((err) => {
            console.error(`${SERVICE_NAME}, Error saving log to MongoDB:`, err);
            setTimeout(() => { addNewLog(log), 10 * 1000 });
        });
}

module.exports = {
    addNewLog
}
