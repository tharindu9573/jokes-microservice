const mysql = require('mysql');
const SERVICE_NAME = process.env.SERVICE_NAME;

const connection = mysql.createConnection({
    host: process.env.BASE_URL,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: 'Jokes',
    port: process.env.MYSQL_CONTAINER_PORT
});

function connectDb() {
    setTimeout(() => {
        try {
            connection.connect(err => {
                if (err) {
                    console.error(`${SERVICE_NAME}, Error connecting to MySQL. Error: `, err.message);
                } else {
                    console.log(`${SERVICE_NAME}, Connected to MySQL database`);
                }
            });
        }
        catch (err) {
            console.error(`${SERVICE_NAME}, Error: `, err.message);
            console.log(`${SERVICE_NAME}, Attempting to reconnect to MySQL...`);
            connectDb();
        }
    }, 50 * 1000);
}

connectDb();

async function insertJoke({ type_id, joke_text, punch_line, type_name }) {
    if (type_id == 0) {
        type_id = await insertType(type_name);
    }
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO joke (joke_text, punch_line, type_id, is_deleted) VALUES (?, ?, ?, ?)', [joke_text, punch_line, type_id, false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function insertType(name) {
    let type = await getTypeByName(name);
    if (!type)
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO type (name) VALUES (?)', name, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

    return new Promise((resolve, reject) => { resolve({ 'insertId': type.id }); });
}

async function getTypeByName(name) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM type WHERE LOWER(name) = ? AND is_deleted = ? LIMIT 0, 1', [name, false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

module.exports = {
    insertJoke
}
