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

module.exports = {
    insertJoke
}
