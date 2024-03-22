const mysql = require('mysql2');

function createScheme() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: `${process.env.BASE_URL}`,
            user: 'root',
            password: `${process.env.MYSQL_ROOT_PASSWORD}`,
            port: process.env.MYSQL_CONTAINER_PORT,
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
              CREATE TABLE IF NOT EXISTS type (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                is_deleted BOOLEAN DEFAULT FALSE
              );
              CREATE TABLE IF NOT EXISTS joke (
                id INT AUTO_INCREMENT PRIMARY KEY,
                joke_text TEXT,
                type_id INT,
                punch_line TEXT,
                is_deleted BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (type_id) REFERENCES type(id)
              );
            `;

            connection.query(sql, (err, results) => {
                if (err) {
                    console.log('Error occurred while creating the scheme:', err);
                    reject(false);
                }
                console.log("Database 'Jokes' and tables 'type' and 'joke' ensured");
                connection.end();
                resolve(true);
            });
        });
    });
}

module.exports = {
    createScheme
}