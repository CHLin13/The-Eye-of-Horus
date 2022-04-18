require('dotenv').config();

const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: 'localhost',
  user: process.env.Mysql_user,
  password: process.env.Mysql_password,
  database: 'eye',
});

module.exports = db;
