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

async function insertJoke({ category_id, joke_text }) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO joke (joke_text, category_id, is_deleted) VALUES (?, ?, ?)', [joke_text, category_id, false], (err, result) => {
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

async function updateJoke({ id, category_id, joke_text }) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE joke SET category_id = ?, joke_text = ? WHERE id = ?', [category_id, joke_text, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function insertCategory({ name }) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO category (name) VALUES (?)', name, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getCategory(id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM category WHERE Id = ? AND is_deleted = ? LIMIT 0, 1', [id, false], (err, result) => {
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
        connection.query('SELECT * FROM  category WHERE is_deleted = ?', false, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function deleteCategory(id) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE category SET is_deleted = ? WHERE id = ?', [true, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function updateCategory({ id, name }) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE category SET name = ? WHERE id = ?', [name, id], (err, result) => {
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
    insertCategory,
    updateCategory,
    getCategory,
    getAllCategories,
    deleteCategory
}
