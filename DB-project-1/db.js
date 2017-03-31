const config = require('./config.json');

const mysql = require('mysql');

module.exports = mysql.createConnection({
	host     : 'localhost',
	user     : config.mysql.user,
	password : config.mysql.password,
	database : config.mysql.db
});
