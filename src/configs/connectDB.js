import mysql from 'mysql2/promise';

// create the connection to database
console.log("Creating connection pool...");
const pool = mysql.createPool({
    host: 'remotemysql.com',
    user: 'ZaSSRc4FOj',
    database: 'ZaSSRc4FOj',
    password: '8axxIxV5hV',
    port: '3306'
});
export default pool;