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
