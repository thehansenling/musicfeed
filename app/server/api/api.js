var express = require('express');
var path = require('path');
var mysql = require('mysql')
var cookieParser = require('cookie-parser');
var http = require('http');
var Spotify = require('node-spotify-api');
var uuidv3 = require('uuid/v3');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var bodyParser = require('body-parser');
var post_router = express.Router();

var connection = mysql.createConnection({
  host     : 'us-cdbr-iron-east-01.cleardb.net',
  user     : 'bc7ebf9f6de242',
  password : 'aa9b1c1f',
  database : 'heroku_cdc4ca7b10e1680',
  multipleStatements: true
});

post_router.use(bodyParser.urlencoded({ extended: false }))
post_router.use(bodyParser.json())


post_router.post('/', (req, res) => {
	const response = new Response();
	res.send({ hello: 'world' });
})


// post_router.post('/about', (req, res) => {
// 	res.send({ test: 'world' });
// })

post_router.post('/about', (req, res) => {
	if (req.body.text != "")
	{
		var user_search_sql = "SELECT * from accounts where username LIKE '" + req.body.text + "%'";
		var song_search_sql = "SELECT * from global_posts where song LIKE '" + req.body.text + "%'";
		var artist_search_sql = "SELECT DISTINCT artist FROM global_posts WHERE artist LIKE '"+ req.body.text + "%'";
		var album_search_sql = "SELECT * from global_posts where album LIKE '" + req.body.text + "%' AND song = 'NO_SONG_ALBUM_ONLY'"
		connection.query(user_search_sql, function (err, result, fields){
			var user_search = result;
			connection.query(song_search_sql, function (err, result, fields){
				var song_search = result;
				connection.query(artist_search_sql, function (err, result, fields){
					var artist_search = result;
					connection.query(album_search_sql, function (err, result, fields){
						var album_search = result;
						res.send({
							users: user_search, 
						    songs: song_search, 
						    artists: artist_search,
						    albums: album_search,
						});
					});
				});
			});
		});
	}
	else
	{
		res.send({});
	}
})
module.exports = post_router;