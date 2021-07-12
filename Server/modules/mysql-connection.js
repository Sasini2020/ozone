const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ozone',
  multipleStatements: true
});

exports.pool = pool;