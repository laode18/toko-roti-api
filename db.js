const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "sql12.freesqldatabase.com",
  user: "sql12796658",
  password: "enNlblbMZd",
  database: "sql12796658",
});

module.exports = pool;
