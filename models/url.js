var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'bahar',
    password : 'jinGuligu.1'
});

connection.query('CREATE DATABASE IF NOT EXISTS url_shortener', function(err){
    if (err) throw err;
    connection.query('USE url_shortener', function(err){
        if (err) throw err;
        connection.query('create table if not exists urlmap( \
             id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,\
             longurl varchar(255), \
             timestamp DATETIME)',function (err) {
                if (err) throw err;
        });
    });
});

