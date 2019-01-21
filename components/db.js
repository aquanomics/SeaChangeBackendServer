// MYSQL DB CONNECTION SETUP
// ===============================================

const  mysql = require('mysql');
const  connection_settings = require('../config');
var db;

//Connect to MySql DB
function connectDatabase() {
    if (!db) {
        //TODO: Use Hardcoded in config values for now.
        db = mysql.createConnection(connection_settings.db);
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