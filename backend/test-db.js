require('dotenv').config();

const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

        console.log('MySQL connected successfully!');

        const [result] = await connection.query('SELECT 1 AS result');
        console.log(result);

        await connection.end();
    } catch (error) {
        console.log('Connection error:', error.code);
        console.log('Error message:', error.message);
    }
}

testConnection();