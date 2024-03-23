const scheme = require('./scheme');
const mysql = require('mysql2');
const SERVICE_NAME = process.env.SERVICE_NAME;

let connection = mysql.createConnection({
    host: process.env.BASE_URL || 'localhost',
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    port: process.env.MYSQL_CONTAINER_PORT || 3306
});


function connectDb() {
    setTimeout(() => {
        try {
            scheme.createScheme().then((res) => {
                if (res) {
                    connection = mysql.createConnection({
                        host: process.env.BASE_URL || 'localhost',
                        user: 'root',
                        password: process.env.MYSQL_ROOT_PASSWORD,
                        database: 'Jokes',
                        port: process.env.MYSQL_CONTAINER_PORT || 3306
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
        connection.query('INSERT INTO joke (joke_text, punch_line, type_id, is_deleted) VALUES (?, ?, ?, ?)', [joke_text, punch_line, type_id, false], (err, result) => {
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
