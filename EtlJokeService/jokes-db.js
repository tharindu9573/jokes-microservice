const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.BASE_URL,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: 'Jokes',
    port: process.env.MYSQL_CONTAINER_PORT
});

function connectDb() {
    setTimeout(() => {
        connection.connect(err => {
            if (err) {
                console.log(err.message);
            } else {
                console.log('ETL JOKE SERVICE: Connected to MySQL database');
            }
        });
    }, 60 * 1000);
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

module.exports = {
    insertJoke
}
