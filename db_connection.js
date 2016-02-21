var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : 'Real_time_demo'
  database        : 'Real_time_demo_db'
});

module.exports.pool = pool;
