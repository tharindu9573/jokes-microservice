const scheme = require('./scheme');
const mysql = require('mysql2');

let connection = mysql.createConnection({
    host: process.env.BASE_URL,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    port: process.env.MYSQL_CONTAINER_PORT
});


function connectDb() {
    setTimeout(() => {
        scheme.createScheme().then((res) => {
            if (res) {
                connection = mysql.createConnection({
                    host: process.env.BASE_URL,
                    user: 'root',
                    password: process.env.MYSQL_ROOT_PASSWORD,
                    database: 'Jokes',
                    port: process.env.MYSQL_CONTAINER_PORT
                });

                connection.connect(err => {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log('JOKE SERVICE: Connected to MySQL database');
                    }
                });
            }
        });
    }, 45 * 1000);
}


connectDb();


async function insertJoke({ type_id, joke_text, punch_line }) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO joke (joke_text, punch_line, type_id, is_deleted) VALUES (?, ?, ?)', [joke_text, punch_line, type_id, false], (err, result) => {
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
        connection.query('SELECT * FROM joke WHERE Id = ? AND is_deleted = ? LIMIT 0, 1', [id, false], (err, result) => {
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
        connection.query('SELECT * FROM joke WHERE is_deleted = ?', false, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function deleteJoke(id) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE joke SET is_deleted = ? WHERE id = ?', [true, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function updateJoke({ id, type_id, joke_text, punch_line }) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE joke SET type_id = ?, joke_text = ?, punch_line = ? WHERE id = ?', [type_id, joke_text, punch_line, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getJokeByTypeId(id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM joke WHERE type_id = ? AND is_deleted = ? ORDER BY RAND() LIMIT 0, 1', [id, false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

async function getJokeByTypeAndCount(type, count) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT joke.* FROM joke
        JOIN type ON joke.type_id = type.id
        WHERE LOWER(type.name) = LOWER(?) AND joke.is_deleted = ?
        ORDER BY RAND()
        LIMIT ${parseInt(count)}`, [type, false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getJokeByCount(count) {
    return new Promise((resolve, reject) => {
        connection.query(` SELECT * FROM joke WHERE joke.is_deleted = ? ORDER BY RAND() LIMIT ${parseInt(count)}`, [false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getJokeByType(type) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT joke.* FROM joke
        JOIN type ON joke.type_id = type.id
        WHERE LOWER(type.name) = LOWER(?) AND joke.is_deleted = ?
        ORDER BY RAND() LIMIT 0, 1`, [type, false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

async function insertType({ name }) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO type (name) VALUES (?)', name, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getType(id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM type WHERE Id = ? AND is_deleted = ? LIMIT 0, 1', [id, false], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
}

async function getAllTypes() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM  type WHERE is_deleted = ?', false, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function deleteType(id) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE type SET is_deleted = ? WHERE id = ?', [true, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function updateType({ id, name }) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE type SET name = ? WHERE id = ?', [name, id], (err, result) => {
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
    deleteJoke,
    getJokeByType,
    getJokeByTypeAndCount,
    getJokeByCount,
    getJokeByTypeId,
    insertType,
    updateType,
    getType,
    getAllTypes,
    deleteType
}
