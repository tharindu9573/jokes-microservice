const mysql = require('mysql2');

function createScheme() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: process.env.MYSQL_URL,
            user: 'root',
            password: process.env.MYSQL_ROOT_PASSWORD,
            // port: process.env.MYSQL_CONTAINER_PORT,
            multipleStatements: true
        });

        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                return;
            }
            const sql = `
                CREATE DATABASE IF NOT EXISTS Jokes;
                USE Jokes;
                CREATE TABLE moderator_joke (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    joke_text TEXT,
                    type_id INT,
                    punch_line TEXT,
                    is_approved BOOLEAN DEFAULT FALSE
                );
            `;

            connection.query(sql, (err, results) => {
                if (err) {
                    console.log('Error occurred while creating the scheme:', err);
                    reject(false);
                }
                console.log("Database 'Jokes' and tables 'moderator_joke' ensured");
                connection.end();
                resolve(true);
            });
        });
    });
}

module.exports = {
    createScheme
}