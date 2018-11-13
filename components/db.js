// MYSQL DB CONNECTION SETUP
// ===============================================

var mysql = require('mysql');
var connection_settings = require('../settings.json');
var db;

//Connect to MySql DB
function connectDatabase() {
    if (!db) {
        //TODO: Use Hardcoded in connection_settings.json values for now.
        db = mysql.createConnection(connection_settings);
        db.connect(function (err) {
            if (err) {
                console.log(err.stack);
            } else {
                console.log('Connected to Database.');
            }
        });
    }
    return db;
}

module.exports = connectDatabase();  