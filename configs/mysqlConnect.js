require('dotenv').config();

const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.MYSQL_URL,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'eye',
});

module.exports = pool;
