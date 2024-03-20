const mysql = require('mysql');

const connection = mysql.createConnection({
    host: `${process.env.BASE_URL}:4002`,
    user: 'root',
    password: 'diamondback',
    database: 'Jokes'
});

function connectDb(){
    setTimeout(() => {
        connection.connect(err => {
            if (err) {
                console.log(err.message);
            } else {
                console.log('Connected to MySQL database');
            }
        });
    }, 45*1000);
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

async function inserttype({ name }) {
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

async function gettype(id) {
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

async function getAllCategories() {
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

async function deletetype(id) {
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

async function updatetype({ id, name }) {
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
    inserttype,
    updatetype,
    gettype,
    getAllCategories,
    deletetype
}
