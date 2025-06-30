const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nama_database_anda'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Terhubung ke database!');
});