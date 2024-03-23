const scheme = require('./scheme');
const mysql = require('mysql2');
const SERVICE_NAME = process.env.SERVICE_NAME;

let connection = mysql.createConnection({
    host: process.env.MYSQL_URL || 'localhost',
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
});

function connectDb() {
    setTimeout(() => {
        try {
            scheme.createScheme().then((res) => {
                if (res) {
                    connection = mysql.createConnection({
                        host: process.env.MYSQL_URL || 'localhost',
                        user: 'root',
                        password: process.env.MYSQL_ROOT_PASSWORD,
                        database: 'Jokes',
                    });

                    connection.connect(err => {
                        if (err) {
                            console.error(`${SERVICE_NAME}, Error connecting to MySQL. Error: `, err.message);
                        } else {
                            console.log(`${SERVICE_NAME}, Connected to MySQL database`);
                        }
                    });
                }
            });
        }
        catch (err) {
            console.error(`${SERVICE_NAME}, Error: `, err.message);
            console.log(`${SERVICE_NAME}, Attempting to reconnect to MySQL...`);
            connectDb();
        }
    }, 45 * 1000);
}

connectDb();

async function insertJoke({ type_id, joke_text, punch_line }) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO moderate_joke (joke_text, punch_line, type_id, is_approved) VALUES (?, ?, ?, ?)', [joke_text, punch_line, type_id, false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getJoke(id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM moderate_joke WHERE Id = ? LIMIT 0, 1', id, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

async function getAllJoke() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM moderate_joke', (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getUnapprovedJoke() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM moderate_joke WHERE is_approved = ? LIMIT 0, 1', [false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

async function deleteJoke(id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM moderate_joke WHERE id = ?', id, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function updateJoke({ id, type_id, joke_text }) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE moderate_joke SET type_id = ?, joke_text = ?, punch_line = ? WHERE id = ?', [type_id, joke_text, punch_line, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function approveJoke(id) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE moderate_joke SET is_approved = ? WHERE Id = ?', [true, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    insertJoke,
    updateJoke,
    getAllJoke,
    getJoke,
    approveJoke,
    getUnapprovedJoke,
    deleteJoke
}
