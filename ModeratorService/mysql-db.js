const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'mysql-db',
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
        connection.query('INSERT INTO moderator_joke (joke_text, punch_line, type_id, is_approved) VALUES (?, ?, ?, ?)', [joke_text, punch_line, type_id, false], (err, result) => {
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
        connection.query('SELECT * FROM moderator_joke WHERE Id = ? LIMIT 0, 1', id, (err, result) => {
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
        connection.query('SELECT * FROM moderator_joke', (err, result) => {
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
        connection.query('DELETE FROM moderator_joke WHERE id = ?', id, (err, result) => {
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
        connection.query('UPDATE moderator_joke SET type_id = ?, joke_text = ?, punch_line = ? WHERE id = ?', [type_id, joke_text, punch_line, id], (err, result) => {
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
        connection.query('UPDATE moderator_joke SET is_approved = ? WHERE Id = ?', [true, id], (err, result) => {
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
    deleteJoke
}
