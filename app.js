var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var config = require('./config');
var base58 = require('./base58.js');
var config = require('./config');
//var url = require('./models/url');
var mysql = require('mysql');
var async = require('async');

//use middleware body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// specify file path for our express server
app.use(express.static(path.join(__dirname,'controler')));

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'bahar',
    password : 'jinGuligu.1'
});

//create table
connection.query('CREATE DATABASE IF NOT EXISTS url_shortener', function(err){
    if (err) throw err;
    connection.query('USE url_shortener', function(err){
        if (err) throw err;
        connection.query('create table if not exists urlmap( \
             id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, \
             longurl varchar(255), \
             timestamp DATETIME)',function (err) {
                if (err) throw err;
        });
    });
});

// home page
app.get('/', function(req, res) {
    //res.send("Welcome to URL Shortner Service!");
    res.sendFile(path.join(__dirname,"/views/index.html"));
    
});

// route to create and return the shortened url given a long url
app.post('/api/shorten', function(req,res) {
    var longUrl = req.body.url; 
    var shortUrl = '';
    var result = "";
    var urlId;
    //check if url exists in db and if not create one
    async.series(
    [
    function(callback) { 
        console.log('1st Function\n' );
        connection.query('SELECT id FROM urlmap WHERE longurl = ?' , [longUrl], function(err,rows) {
            if(err) throw err;
            console.log("rows:: " , rows, "length: ", rows.length);
            if (rows.length > 0) {
                result = JSON.parse(JSON.stringify(rows));
                urlId = result[0].id;
                console.log("results: " , result, "\n id: ", urlId);
                callback();
            } else { 
                callback();
            }
        });
    },
    function (callback) {
        console.log('2nd Function\n' );
        if(result.length > 0) {
            console.log("url already exists in DB");
            callback();
        } else {
            console.log('Starting 2nd query\n' );
            var timeStamp = new Date();
            var data = {longurl: longUrl, timestamp: timeStamp};
            connection.query("INSERT INTO urlmap SET ?" , data, function(err,rows,fields) {
                if(err) throw err;
                
                result = JSON.parse(JSON.stringify(rows));
                urlId = rows.insertId;
                console.log(`rows: ${rows} --\n result: ${result} -- urlId: ${urlId} \n fields: ${fields}`);
                callback();
            });
        }
        }
    ], function(err,results) {
        console.log(`all functions complete -- results: ${results}`);
        //create short url
        shortUrl = config.webhost + base58.encode(urlId);
        console.log("shortURL: ", shortUrl);
        res.send({'shortUrl': shortUrl});
        
        //connection.end();
    });
}); 

// route to get short url and redirect user to the oriinal url
app.get('/:short_url', function(req,res){
    var encoded_id = req.params.short_url;
    var id = base58.decode(encoded_id);
    console.log(`encoded_id: ${encoded_id} -- id: ${id} `);
    var longUrl = '';
    //look for id in DB
    async.series(
        [
            function(callback) { 
                console.log('1st Function\n' );
                connection.query('SELECT longurl FROM urlmap WHERE id = ?' , [id], function(err,rows) {
                    if(err) throw err;
                    if (rows.length > 0) {
                        result = JSON.parse(JSON.stringify(rows));
                        longUrl = result[0].longurl;
                        console.log("results: " , result, "\n longURL: ", longurl);
                        callback(null,longUrl);
                    } else { 
                        callback(null,longUrl);
                    }
                });
            }
        ], function(err,results) {
            console.log(`All redirect functions -- results: ${results}`);
            console.log(`longUrl: ${results}`);
            if (results) {
                res.redirect(results)
            } else {
                res.status(400).send("Reqesut page not found");
            }
            //connection.end();
        });
}); 

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});