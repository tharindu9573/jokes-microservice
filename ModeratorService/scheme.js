const mysql = require('mysql2');

const SERVICE_NAME = process.env.SERVICE_NAME;

function createScheme() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: process.env.MYSQL_URL || 'localhost',
            user: 'root',
            password: process.env.MYSQL_ROOT_PASSWORD,
            multipleStatements: true
        });

        connection.connect((err) => {
            if (err) {
                console.error(`${SERVICE_NAME}, Error connecting to MySQL:`, err);
                return;
            }
            const sql = `
                CREATE DATABASE IF NOT EXISTS Jokes;
                USE Jokes;
                CREATE TABLE IF NOT EXISTS moderate_joke (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    joke_text TEXT,
                    punch_line TEXT,
                    type_id INT,
                    is_approved BOOLEAN DEFAULT FALSE
                );
            `;

            connection.query(sql, (err, results) => {
                if (err) {
                    console.log(`${SERVICE_NAME}, Error occurred while creating the scheme:`, err);
                    reject(false);
                }
                console.log(`${SERVICE_NAME}, Database 'Jokes' and tables 'moderate_joke' ensured`);
                connection.end();
                resolve(true);
            });
        });
    });
}

module.exports = {
    createScheme
}