// Get the client
const mysql = require('mysql2');

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sistemaCv',
  port: 3306
});

//Conectar a la base de datos
connection.connect((err) => {
    if(err) {
        console.error('Error conectando a la BD:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

module.exports = connection;