require('dotenv').config();
const mysql = require('mysql2/promise');
const {
  NODE_ENV,
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_DATABASE_TEST,
} = process.env;
const env = NODE_ENV || 'production';
const multipleStatements = NODE_ENV === 'test';

const mysqlConfig = {
  production: {
    // for EC2 machine
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  },
  development: {
    // for localhost development
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  },
  test: {
    // for automation testing (command: npm run test)
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE_TEST,
  },
};

let mysqlEnv = mysqlConfig[env];
mysqlEnv.waitForConnections = true;
mysqlEnv.connectionLimit = 20;

const pool = mysql.createPool(mysqlEnv, { multipleStatements });


module.exports = pool;
