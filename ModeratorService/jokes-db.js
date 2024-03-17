const mysql = require('mysql');

function connectWithRetry(){
    const connection = mysql.createConnection({
        host: 'mysql-db',
        user: 'root',
        password: 'diamondback',
        database: 'Jokes'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err.message);
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log('Connected to MySQL');
        }
    });

    connection.on('error', (err) => {
        console.error('MySQL connection error:', err.message);
        connectWithRetry(); 
    });

    return connection;
}

const connection = connectWithRetry();

async function insertJoke({ category_id, joke_text }) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO moderator_joke (joke_text, category_id, is_approved) VALUES (?, ?, ?)', [joke_text, category_id, false], (err, result) => {
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

async function updateJoke({ id, category_id, joke_text }) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE moderator_joke SET category_id = ?, joke_text = ? WHERE id = ?', [category_id, joke_text, id], (err, result) => {
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
