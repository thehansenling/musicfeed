var path = require('path');
var express = require('express');
var ReactDOMServer = require('react-dom/server');
var post_router = require('./api/api.js')
var mysql = require('mysql')
var cookieParser = require('cookie-parser');

//var {MainApp} = require('../components/App.js');
import React from 'react';
const app = express();

const publicPath = express.static(path.join(__dirname, '../'));
const indexPath = path.join(__dirname, '../public/index.html');
import  {BrowserRouter as Router} from 'react-router-dom'

import App from '../components/App.js';
import { StaticRouter } from 'react-router-dom';
import Home from '../components/Home.js';

app.use(publicPath);
app.use('/', post_router)
app.use(cookieParser());

var POST_LIMIT = 2;
var COMMENT_LIMIT = 5;
var RELEVANT_TIMESTAMP_MAX_AMOUNT = 100;

var connection = mysql.createConnection({
  host     : 'us-cdbr-iron-east-01.cleardb.net',
  user     : 'bc7ebf9f6de242',
  password : 'aa9b1c1f',
  database : 'heroku_cdc4ca7b10e1680',
  multipleStatements: true
});

function MergeSortPosts(list1, list2, list1_full=false, list2_full=false)
{
	var list1_index = 0;
	var list2_index = 0;
    console.log("LISTS")
    console.log(list1.length)
    console.log(list1)
    console.log(list2.length)
    console.log(list2)
    var merged = [];
    while (true)
	{
		
		if (list1.length == 0)
		{
			merged = list2;
			console.log(0);
			console.log(merged)
			return [list2, list2_full]
		}
		if (list2.length == 0)
		{
			merged = list1;
			console.log(1)
			console.log(merged)
			return [list1, list1_full]
		}
		if ((list1_full && list1_index >= list1.length - 1) ||
			(list2_full && list2_index >= list2.length - 1))
		{
			console.log(2)
			console.log(merged)
			return [merged, true]
		}
		else if (list1_index >= list1.length)
		{
			console.log(3)
			console.log(merged)
			merged.push(list2.slice(list2_index));
			return [merged, false];
		}
		else if (list2_index >= list2.length)
		{
			console.log(4)
			console.log(merged)
			merged.push(list1.slice(list1_index));
			return [merged, false];
		}
		else 
		{
	    	if (list1[list1_index]['score'] >= list2[list2_index]['score'])
	    	{
	    		merged.push(list1[list1_index]);
	    		console.log("+list1")
	    		++list1_index;
	    	}
	    	else
	    	{
	    		merged.push(list2[list2_index]);

	    		console.log("+list2")
	    		++list2_index;	
	    	}
		}
	}
}

function GetFeed(req, res, callback, offset, non_priority_offset, global_offset, non_priority_global_offset, limit)
{
	var NUMBER_OF_POSTS = 20;
	var follows_sql = "SELECT * FROM follows where user_id = '" + req.cookies.username + "'";
	connection.query(follows_sql, function (err, result, fields) 
	{
		var followed_artists = "";
		var followed_users = ""
		for (follow of result)
		{
			if (follow.type == 1)
			{
				followed_artists +="'" + follow['followee_id'] + "', ";
			}
			else 
			{
				followed_users += "'" + follow['followee_id'] + "', ";
			}

		}

		if (followed_artists.length > 0)
		{
			followed_artists = followed_artists.substring(0, followed_artists.length - 2);
		}
		else 
		{
			followed_artists = "''";
		}
		if (followed_users.length > 0)
		{
			followed_users = followed_users.substring(0, followed_users.length - 2);
		}
		else 
		{
			followed_users = "''";
		}
		followed_artists = "(" + followed_artists + ")";
		followed_users = "(" + followed_users + ")";

		var modified_limit = String(parseInt(limit) + 1);

		var priority_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN (timestamp - CURRENT_TIMESTAMP)/45000 ELSE LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (timestamp - CURRENT_TIMESTAMP)/45000 END as score FROM user_content WHERE username in " + followed_users + " OR artist in " + followed_artists + " ORDER BY score DESC LIMIT " + modified_limit + " OFFSET " + offset;
		connection.query(priority_sql, function (err, result, fields) 
		{
			var priority_results = result;
			console.log(priority_sql)
			var sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN (timestamp - CURRENT_TIMESTAMP)/45000 ELSE LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (timestamp - CURRENT_TIMESTAMP)/45000 END as score FROM user_content WHERE username NOT in " + followed_users + " AND artist NOT in " + followed_artists + " ORDER BY score DESC LIMIT " + modified_limit + " OFFSET " + non_priority_offset;
			console.log(sql);
			connection.query(sql, function (err, result, fields)  
			{
			    if (err) throw err;
			    var non_priority_results = result;
				var priority_global_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN (relevant_timestamp - CURRENT_TIMESTAMP)/45000 ELSE LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (relevant_timestamp - CURRENT_TIMESTAMP)/45000 END as score FROM global_posts WHERE artist in " + followed_artists + " ORDER BY score DESC LIMIT " + modified_limit + " OFFSET " + global_offset;
				console.log(priority_global_sql)
				connection.query(priority_global_sql, function (err, result, fields) 
				{
					var priority_global_results = result;

					var non_priority_global_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN (relevant_timestamp - CURRENT_TIMESTAMP)/45000 ELSE LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (relevant_timestamp - CURRENT_TIMESTAMP)/45000 END as score FROM global_posts WHERE artist NOT in " + followed_artists + " ORDER BY score DESC LIMIT " + modified_limit + " OFFSET " + non_priority_global_offset;
					console.log(non_priority_global_sql)
					connection.query(non_priority_global_sql, function (err, result, fields) 
					{					
						console.log("first");
						console.log(priority_results);
						console.log("second")
						console.log(non_priority_results);
						var non_priority_global_results = result;
					    var PRIORITY_MODIFIER = 2
					    //increase the score of the priority posts
					    if (priority_results != undefined)
					    {
						    for (post of priority_results)
						    {
						    	post['score'] = post['score'] + PRIORITY_MODIFIER;
						    	post['offset_type'] = 0;
						    }
						}
						if (non_priority_results != undefined)
						{
							for (var post of non_priority_results)
							{
								post['offset_type'] = 1;
							}
						}
						if (priority_global_results != undefined)
						{
							for (var post of priority_global_results)
							{
								post['offset_type'] = 2;
							}
						}
						if (non_priority_global_results != undefined)
						{
							for (var post of non_priority_global_results)
							{
								post['offset_type'] = 3;
							}
						}

					    //merge sort the two lists
					    // test if priority result or result doesn't exist
					    console.log("FIRST MERGE");
					    var merged_user = MergeSortPosts(priority_results, non_priority_results, 
					    								 priority_results.length == modified_limit, non_priority_results.length == modified_limit)
					    console.log("SECOND MERGE");
					    var merged_priority_global = MergeSortPosts(merged_user[0], priority_global_results,
					    											merged_user[1], priority_global_results.length == modified_limit);
					    console.log("THIRD MERGE");
					    var merged_result = MergeSortPosts(merged_priority_global[0], non_priority_global_results,
					    								   merged_priority_global[1], non_priority_global_results.length == modified_limit); 
					    console.log("RESULT");
					    console.log(merged_result);
					    merged_result = merged_result[0]
					    var songs_list = [];
						var post_ids = ""
					    for (var i =0; i < merged_result.length; ++i)
						{
							songs_list.push(merged_result[i]);
							post_ids = post_ids + "'" + merged_result[i].post_id + "',"
						}
						if (post_ids.length > 0) post_ids = post_ids.substring(0, post_ids.length-1);

						var like_sql = "SELECT post_id, like_state FROM likes WHERE user_id = '" + 
										req.cookies.username + "'" + "AND post_id in (" + post_ids + ")";
						connection.query(like_sql, function (err, result, fields) 
						{
							var likes_list = [];
							if (result != undefined)
							{
								for (i =0; i < result.length; ++i)
								{
									likes_list.push(result[i])
								}
								var num_comments_sql ="";
								for (var id of post_ids.split(","))
								{
									num_comments_sql = num_comments_sql + "SELECT COUNT(comment_id), post_id FROM comments WHERE post_id =" + id + "; " ;
								}
							}
							connection.query(num_comments_sql, function (err, result, fields) 
							{
								console.log(num_comments_sql);
								console.log(result);
								var num_comments_list = [];
								if (result != undefined)
								{
									if (result.length == 1)
									{
										num_comments_list.push({'count':result[0]["COUNT(comment_id)"], 'post_id':result[0]["post_id"] });
									}
									else 
									{
										for (i =0; i < result.length; ++i)
										{
											num_comments_list.push({'count':result[i][0]["COUNT(comment_id)"], 'post_id':result[i][0]["post_id"] });
										}
									}	
								}
								var priorities_sql = "SELECT * FROM follows WHERE post_id in (" + post_ids + ")";
								connection.query(num_comments_sql, function (err, result, fields) 
								{
									callback(songs_list, likes_list, result);
								});

							});			
						});
					});
				});
			});
		});
	});
}

function SendFeed(req, res, limit)
{
	console.log(parseInt(req.body.offset))
		console.log(parseInt(req.body.non_priority_offset))
		console.log(parseInt(req.body.global_offset))
		console.log(parseInt(req.body.non_priority_global_offset))
	var data = GetFeed(req, res, 
		function (songs_list, likes_list, num_comments_list) {
			res.send(
			{
				songs: songs_list,
				likes: likes_list,
				num_comments: num_comments_list,
				post_limit: limit,
			});	
		}, 
		parseInt(req.body.offset), 
		parseInt(req.body.non_priority_offset),
		parseInt(req.body.global_offset),
		parseInt(req.body.non_priority_global_offset),
		POST_LIMIT);
	console.log("SENDING FEED");
	console.log(req.body.offset);
}

function GetComments(level, limit, post_id, comment_ids, offset = 0)
{
	return new Promise(function(resolve, reject) {

		var sql = "SELECT *, ((upvotes + 1.9208) / (upvotes + downvotes) - 1.96 * SQRT((upvotes * downvotes) / (upvotes + downvotes) + 0.9604) / (upvotes + downvotes)) / (1 + 3.8416 / (upvotes + downvotes)) AS order_score FROM comments WHERE post_id = '" + String(post_id) +"'  AND comment_level = " + level + " AND parent_comment_id in (" + comment_ids + ") ORDER by order_score DESC LIMIT " + limit + " OFFSET " + offset;
		console.log(sql);
		connection.query(sql, function (err, result, fields) 
		{
			var comment_ids = "";
			var comment_list = [];
			if (result != undefined)
			{
				for (var i = 0; i < result.length; ++i)
				{
					if (result[i]['order_score'] == undefined)
					{
						result[i]['order_score'] = 0;
					}
					comment_list.push(result[i]);
					comment_ids += "'";
					comment_ids = comment_ids + result[i].comment_id + "',"
				}
			}
			if (comment_ids.length > 0) 
			{
				console.log(comment_ids)
				comment_ids = comment_ids.substring(0, comment_ids.length-1)
				var comment_votes_sql = "SELECT comment_id, vote_state FROM comment_votes WHERE comment_id in (" + comment_ids + ") ";
				console.log(comment_votes_sql);
				connection.query(comment_votes_sql, function (err, result, fields) 
				{
					var comment_votes_list = [];
					var post_ids = ""
					if (result != undefined)
					{
					    for (i =0; i < result.length; ++i)
						{
							comment_votes_list.push(result[i]);	
						}
						resolve({
							comments: comment_list,
							comment_votes:comment_votes_list,
							comment_ids:comment_ids,
						});
					}
				});
			}
			else
			{
				resolve({
					comments: [],
					comment_votes:[],
				});
			}
		});
	});
}

function ScorePost(post_info)
{
	if (post_info == undefined)
	{
		return 0;
	}
	return Math.max(post_info[2], .01) * (Math.abs(post_info[0]) + post_info[1] * 10);
}

function SortPosts(post_data, posts)
{
	var final_list = [];
	for (var key in post_data)
	{
		var score = ScorePost(post_data[key]);
		var insert_index = 0;
		for (var post_index in final_list)
		{
			var compare_score = ScorePost(final_list[post_index][1]);
			if (score < compare_score)
			{
				++insert_index;
			}
			else 
			{
				break;
			}
		}
		var insert_item = [key, (post_data[key])];
		final_list.splice(insert_index, 0, insert_item);
	}
	return final_list;
}

function AggregateLikes(comments, likes, priorities)
{
	var post_info = {}
	for (var like_data of likes)
	{
		if (like_data.id != null)
		{
			post_info[like_data.id] = [like_data.likes];
		}
		else 
		{
			post_info[like_data.post_id] = [like_data.likes];
		}
	}

	for (var comment_data of comments)
	{
		if (comment_data.post_id != null )
		{
			post_info[comment_data.post_id].push(comment_data.count);
		}
		else if (comment_data.id != null)
		{
			post_info[comment_data.post_id].push(comment_data.count);
		}
		
	}
	for (var key in post_info)
	{
		if (post_info[key].length < 2)
		{
			post_info[key].push(0);
		}
	}

	for (var priority_data of priorities)
	{

		if (priority_data.post_id == null)
		{
			continue;
		}
		post_info[priority_data.post_id].push(priority_data.priority);
	}
	for (var key in post_info)
	{
		if (post_info[key].length < 3)
		{
			post_info[key].push(0.001);
		}
	}

	SortPosts(post_info);

	return post_info;
}

function OrderPosts(ordered_list, all_data)
{
	var ordered_posts = [];
	var leftover_posts = [];
	for (var index in ordered_list)
	{
		for (var all_index in all_data)
		{
			if (ordered_list[index][0] == all_data[all_index].id || ordered_list[index][0] == all_data[all_index].post_id)
			{
				ordered_posts.push(all_data[all_index]);
				break;
			}
			if (all_index == all_data.length - 1)
			{

				leftover_posts.push(all_data[all_index]);
			}
		}
	}
	ordered_posts = ordered_posts.concat(leftover_posts);
	return ordered_posts;
}

function renderPage(url, data)
{
	var html = ReactDOMServer.renderToString(<StaticRouter location={url} context={context}><App data = {data}/></StaticRouter>)
	html = ' <script>window.__DATA__ = ' + JSON.stringify(data) + '</script>' + html 
	console.log(html);
	return html;
}

var context = {};

app.get('/', (req, res) => {
	//var html = ReactDOMServer.renderToString(<StaticRouter location={req.url} context={context}><App/></StaticRouter>)
	//var html = ReactDOMServer.renderToString(<Home test= "testing"/>)
	// html = renderPage(html, {});
	// console.log(html);
	// res.send(html);

	var data = GetFeed(req, res, 
		function (songs_list, likes_list, num_comments_list) {

			// res.render('pages/feed', 
			// {
			// 	songs: songs_list,
			// 	likes: likes_list,
			// 	num_comments: num_comments_list,
			// });	
			var data = {songs: songs_list,
									likes: likes_list,
									num_comments: num_comments_list,}
			//var html = ReactDOMServer.renderToString(<StaticRouter location={req.url} context={context}><App data = {data}/></StaticRouter>)
			//var html = ReactDOMServer.renderToString(<Home test= "testing"/>)

			var html = renderPage(req.url, data);
			console.log(html);
			res.send(html);

		}, 
		0, 
		0,
		0,
		0,
		POST_LIMIT);

})


app.get('/about', (req, res) => {
	var html = renderPage(req.url, {});
	console.log(html);
	res.send(html);
})

app.get('/user/:user/:post_id', function (req, res) {

	var sql = "SELECT * FROM user_content WHERE username = '" + req.params.user + "'" + " AND id = '" + req.params.post_id + "'";
	console.log(sql);
	connection.query(sql, function (err, result, fields) 
	{
		var user_post = result;
		var current_post_id = "";
		console.log(user_post)

		var comment_promise_0 = GetComments(0, COMMENT_LIMIT, req.params.post_id, -1)
		comment_promise_0.then(function(response_0) {
			console.log("RESPONSE 0")
			console.log(response_0)
		  var comment_promise_1 = GetComments(1, COMMENT_LIMIT, req.params.post_id, response_0['comment_ids'])
		  comment_promise_1.then(function(response_1) {
		  	  console.log("RESPONSE 1");
		  	  console.log(response_1);
			  var comment_promise_2 = GetComments(2, COMMENT_LIMIT, req.params.post_id, response_1['comment_ids'])
			  comment_promise_2.then(function(response_2) {

			  	  var all_comments = []
			  	  var all_comment_votes = []
			  	  for (var comment of response_0['comments'])
			  	  {
			  	  	  all_comments.push(comment);
			  	  }
			  	  for (var comment of response_1['comments'])
			  	  {
			  	  	  all_comments.push(comment);
			  	  }
			  	  for (var comment of response_2['comments'])
			  	  {
			  	  	  all_comments.push(comment);
			  	  }

			  	  for (var comment_vote of response_0['comment_votes'])
			  	  {
			  	  	  all_comment_votes.push(comment_vote);
			  	  }
			  	  for (var comment_vote of response_1['comment_votes'])
			  	  {
			  	  	  all_comment_votes.push(comment_vote);
			  	  }
			  	  for (var comment_vote of response_2['comment_votes'])
			  	  {
			  	  	  all_comment_votes.push(comment_vote);
			  	  }
			  	  if (user_post.length = 1)
			  	  	user_post = user_post[0];
					var data = {
					  user_post: user_post,
					  comments: all_comments,
					  comment_votes:all_comment_votes,
					}

					var html = renderPage(req.url, data)
					res.send(html);

			  }, function(error_2) {
			  	console.error("Failed!", error_2);
			  })


		  }, function(error_1) {
		  	console.error("Failed!", error_1);
		  })

		}, function(error_0) {
		  console.error("Failed!", error_0);
		})
	});
});

app.get('/user/:user/', (req, res) => {
	var sql = "SELECT * FROM user_content where username = '" + req.params.user + "'ORDER BY timestamp";
	connection.query(sql, function (err, result, fields) 
	{
	    if (err) throw err;
	    //console.log(result);
	    var songs_list = [];
		var post_ids = ""
	    for (var i =0; i < result.length; ++i)
		{
			songs_list.push(result[i]);
			post_ids = post_ids + "'" + result[i].post_id + "',"
		}
		if (post_ids.length > 0) post_ids = post_ids.substring(0, post_ids.length-1);
		var like_sql = "SELECT post_id, like_state FROM likes WHERE user_id = '" + 
						req.cookies.username + "'" + "AND post_id in (" + post_ids + ")";
		connection.query(like_sql, function (err, result, fields) 
		{
			var likes_list = [];
			if (result != undefined)
			{
				for (i =0; i < result.length; ++i)
				{
					likes_list.push(result[i])
				}
				var num_comments_sql ="";
				for (var id of post_ids.split(","))
				{
					num_comments_sql = num_comments_sql + "SELECT COUNT(comment_id), post_id FROM comments WHERE user_id = '" + req.cookies.username 
										+ "'" + "AND post_id =" + id + " UNION " ;
				}
				num_comments_sql = num_comments_sql.substr(0, num_comments_sql.length-6);
			}
			connection.query(num_comments_sql, function (err, result, fields) 
			{
				var num_comments_list = [];
				if (result != undefined)
				{
					for (i =0; i < result.length; ++i)
					{
						num_comments_list.push({'count':result[i]["COUNT(comment_id)"], 'post_id':result[i]["post_id"] });
					}
				}
				var follow_sql = "SELECT * FROM follows WHERE followee_id = '" + req.params.user + "'";
				connection.query(follow_sql, function (err, result, fields) 
				{
					var follows_data = result;
					var followee_sql = "SELECT COUNT(*) FROM follows WHERE user_id = '" + req.params.user +"'";
					connection.query(followee_sql, function (err, result, fields) 
					{
						var followees = result[0]['COUNT(*)'];

						var user_sql = "SELECT * FROM accounts WHERE username = '" + req.params.user +"'";
						connection.query(user_sql, function (err, result, fields) 
						{
							console.log(result);
							var data = {
								songs: songs_list,
								likes: likes_list,
								num_comments: num_comments_list,
								follows: follows_data,
								followees: followees,
								user: result[0],
							}
							var html = renderPage(req.url, data)
							res.send(html);
						});
					});
				});
			});			
		});
	});
});

app.get('/artist/:artist/', (req, res) => {

	var album_sql = "SELECT * from global_posts WHERE artist = '" + req.params.artist + "' AND song = 'NO_SONG_ALBUM_ONLY'"
	var album_post_ids = "";
	connection.query(album_sql, function (err, result, fields) 
	{
	    for (var i = 0; i < result.length; ++i)
		{
			album_post_ids = album_post_ids + "'" + result[i].post_id + "',"
		}
		if (album_post_ids.length > 0) album_post_ids = album_post_ids.substring(0, album_post_ids.length-1);
		var album_data = result;

		if (result != undefined)
		{
			var num_album_comments_sql ="";
			for (var id of album_post_ids.split(","))
			{
				num_album_comments_sql = num_album_comments_sql + "SELECT COUNT(comment_id), post_id FROM comments WHERE post_id =" + id + "; " ;
			}
		}
		connection.query(num_album_comments_sql, function (err, result, fields) 
		{
			var num_album_comments_list = [];
			if (result != undefined)
			{
				if (result.length == 1)
				{
					num_album_comments_list.push({'count':result[0]["COUNT(comment_id)"], 'post_id':result[0]["post_id"] });
				}
				else
				{
					for (i =0; i < result.length; ++i)
					{
						num_album_comments_list.push({'count':result[i][0]["COUNT(comment_id)"], 'post_id':result[i][0]["post_id"] });
					}
				}
			}

			var priorities = {}
			console.log(album_data)
			var album_post_data = AggregateLikes(num_album_comments_list, album_data, []);
			var ordered_song_data = SortPosts(album_post_data);
			var ordered_albums = OrderPosts(ordered_song_data, album_data);
			var song_sql = "SELECT * from global_posts WHERE artist = '" + req.params.artist + "' AND song != 'NO_SONG_ALBUM_ONLY'";
			var song_post_ids = "";
			connection.query(song_sql, function (err, result, fields) 
			{
				console.log(result);
			    for (i =0; i < result.length; ++i)
				{
					song_post_ids = song_post_ids + "'" + result[i].post_id + "',"
				}
				if (song_post_ids.length > 0) song_post_ids = song_post_ids.substring(0, song_post_ids.length-1);
				var song_data = result;

				if (result != undefined)
				{
					var num_song_comments_sql ="";
					for (id of song_post_ids.split(","))
					{
						num_song_comments_sql = num_song_comments_sql + "SELECT COUNT(comment_id), post_id FROM comments WHERE post_id =" + id + "; " ;
					}
				}
				connection.query(num_song_comments_sql, function (err, result, fields) 
				{
					var num_song_comments_list = [];
					if (result != undefined)
					{
						if (result.length == 1)
						{
							num_song_comments_list.push({'count':result[0]["COUNT(comment_id)"], 'post_id':result[0]["post_id"] });
						}
						else
						{
							for (i = 0; i < result.length; ++i)
							{
								num_song_comments_list.push({'count':result[i][0]["COUNT(comment_id)"], 'post_id':result[i][0]["post_id"] });
							}
						}
					}

					priorities = {}
					var song_like_data = []
					for (var song of song_data)
					{
						var like_data = {}

						like_data["id"] = song.post_id;
						like_data["likes"] = song.likes;
						song_like_data.push(like_data);
					}
					var song_post_data = AggregateLikes(num_song_comments_list, song_like_data, []);
					var ordered_song_data = SortPosts(song_post_data);
					var ordered_songs = OrderPosts(ordered_song_data, song_data);
					var data = {
						artist: req.params.artist,
						album_data: ordered_albums,
						song_data: ordered_songs,
					}	

					var html = renderPage(req.url, data)
					res.send(html);
				});	


			});

		});


	});

})

app.get('/artist/:artist/songs', function (req, res) {
	var song_sql = "SELECT * from global_posts WHERE artist = '" + req.params.artist + "' AND song != 'NO_SONG_ALBUM_ONLY'";
	var song_post_ids = "";
	connection.query(song_sql, function (err, result, fields) 
	{
	    for (var i = 0; i < result.length; ++i)
		{
			song_post_ids = song_post_ids + "'" + result[i].post_id + "',"
		}
		if (song_post_ids.length > 0) song_post_ids = song_post_ids.substring(0, song_post_ids.length-1);
		var song_data = result;

		if (result != undefined)
		{
			var num_song_comments_sql ="";
			for (var id of song_post_ids.split(","))
			{
				num_song_comments_sql = num_song_comments_sql + "SELECT COUNT(comment_id), post_id FROM comments WHERE post_id =" + id + "; " ;
			}
		}
		connection.query(num_song_comments_sql, function (err, result, fields) 
		{
			var num_song_comments_list = [];
			if (result != undefined)
			{
				if (result.length == 1)
				{
					num_song_comments_list.push({'count':result[0]["COUNT(comment_id)"], 'post_id':result[0]["post_id"] });
				}
				else
				{
					for (i = 0; i < result.length; ++i)
					{
						num_song_comments_list.push({'count':result[i][0]["COUNT(comment_id)"], 'post_id':result[i][0]["post_id"] });
					}
				}
			}
			var priorities = {}
			var song_like_data = []
			for (var song of song_data)
			{
				var like_data = {}

				like_data["id"] = song.post_id;
				like_data["likes"] = song.likes;
				song_like_data.push(like_data);
			}
			var song_post_data = AggregateLikes(num_song_comments_list, song_like_data, []);
			var ordered_song_data = SortPosts(song_post_data);
			var ordered_songs = OrderPosts(ordered_song_data, song_data);

			var data =
			{
				song_data: ordered_songs,
			};		
			var html = renderPage(req.url, data)
			res.send(html);
		});
	});
});

app.get('/artist/:artist/albums', function (req, res) {
	var album_sql = "SELECT * from global_posts WHERE artist = '" + req.params.artist + "' AND song = 'NO_SONG_ALBUM_ONLY'"
	var album_post_ids = "";
	connection.query(album_sql, function (err, result, fields) 
	{
	    for (var i = 0; i < result.length; ++i)
		{
			album_post_ids = album_post_ids + "'" + result[i].post_id + "',"
		}
		if (album_post_ids.length > 0) album_post_ids = album_post_ids.substring(0, album_post_ids.length-1);
		var album_data = result;

		if (result != undefined)
		{
			var num_album_comments_sql ="";
			for (var id of album_post_ids.split(","))
			{
				num_album_comments_sql = num_album_comments_sql + "SELECT COUNT(comment_id), post_id FROM comments WHERE post_id =" + id + "; " ;
			}
		}
		connection.query(num_album_comments_sql, function (err, result, fields) 
		{
			var num_album_comments_list = [];
			if (result != undefined)
			{
				if (result.length == 1)
				{
					num_album_comments_list.push({'count':result[0]["COUNT(comment_id)"], 'post_id':result[0]["post_id"] });
				}
				else
				{
					for (var i = 0; i < result.length; ++i)
					{
						num_album_comments_list.push({'count':result[i][0]["COUNT(comment_id)"], 'post_id':result[i][0]["post_id"] });
					}
				}
			}

			var priorities = {}

			var album_post_data = AggregateLikes(num_album_comments_list, album_data, []);
			var ordered_song_data = SortPosts(album_post_data);
			var ordered_albums = OrderPosts(ordered_song_data, album_data);

			var data =
			{
				album_data: ordered_albums,
			};
			var html = renderPage(req.url, data)
			res.send(html);
		});
	});
});


app.get('/post/:artist/:song', function (req, res) {
	var sql = "SELECT * FROM global_posts WHERE artist = '" + String(req.params.artist) + "'" + " AND song = '" + String(req.params.song) + "'";
	connection.query(sql, function (err, result, fields) 
	{
		var content = result;
		var like_post_id = "";
		if (result.length != 0)
		{
			like_post_id = result[0].post_id;
		}

		var post_ids = ""
		if (result != undefined)
		{
			var songs_list = []
		    for (var i = 0; i < result.length; ++i)
			{
				songs_list.push(result[i]);
				post_ids = post_ids + "'" + result[i].post_id + "',"
			}
			if (post_ids.length > 0) post_ids = post_ids.substring(0, post_ids.length-1);
		}

		var like_state_sql = "SELECT like_state from likes where post_id = '"+ String(like_post_id) + "' AND user_id = '" + req.cookies.username + "'";
		connection.query(like_state_sql, function (err, result, fields) 
		{		
			var user_like_state;
			if (result.length == 0)
			{
				user_like_state = -1;
			} else 
			{
				user_like_state = result[0].like_state;
			}

			console.log("WAGNDLKAGNA")
			console.log(content[0]['post_id']);
			var comment_promise_0 = GetComments(0, COMMENT_LIMIT, content[0]['post_id'], -1)
			comment_promise_0.then(function(response_0) {
				console.log("RESPONSE 0")
				console.log(response_0)
			  var comment_promise_1 = GetComments(1, COMMENT_LIMIT, content[0]['post_id'], response_0['comment_ids'])
			  comment_promise_1.then(function(response_1) {
			  	  console.log("RESPONSE 1");
			  	  console.log(response_1);
				  var comment_promise_2 = GetComments(2, COMMENT_LIMIT, content[0]['post_id'], response_1['comment_ids'])
				  comment_promise_2.then(function(response_2) {

				  	  var all_comments = []
				  	  var all_comment_votes = []
				  	  for (var comment of response_0['comments'])
				  	  {
				  	  	  all_comments.push(comment);
				  	  }
				  	  for (var comment of response_1['comments'])
				  	  {
				  	  	  all_comments.push(comment);
				  	  }
				  	  for (var comment of response_2['comments'])
				  	  {
				  	  	  all_comments.push(comment);
				  	  }

				  	  for (var comment_vote of response_0['comment_votes'])
				  	  {
				  	  	  all_comment_votes.push(comment_vote);
				  	  }
				  	  for (var comment_vote of response_1['comment_votes'])
				  	  {
				  	  	  all_comment_votes.push(comment_vote);
				  	  }
				  	  for (var comment_vote of response_2['comment_votes'])
				  	  {
				  	  	  all_comment_votes.push(comment_vote);
				  	  }



						var data = 
						{
							data: content[0],
							comments: all_comments,
							comment_votes:all_comment_votes,
							like_state: user_like_state,
						};
						var html = renderPage(req.url, data)
						res.send(html);


				  }, function(error_2) {
				  	console.error("Failed!", error_2);
				  })


			  }, function(error_1) {
			  	console.error("Failed!", error_1);
			  })

			}, function(error_0) {
			  console.error("Failed!", error_0);
			})

		});
 	});
});

app.get('/album/:artist/:album', function (req, res) {
	var sql = "SELECT * FROM global_posts WHERE artist = '" + req.params.artist + "'" + " AND album = '" + req.params.album + "' AND type = 1";
	connection.query(sql, function (err, result, fields) 
	{

		var content = result;
		var like_state_sql = "SELECT like_state from likes where post_id = '"+ String(result[0].post_id) + "' AND user_id = '" + req.cookies.username + "'";
		connection.query(like_state_sql, function (err, result, fields) 
		{		
			var user_like_state;
			if (result.length == 0)
			{
				user_like_state = -1;	
			} else 
			{
				user_like_state = result[0].like_state;
			}

			sql = "SELECT * FROM user_content where artist = '" + req.params.artist + "' AND album = '" + req.params.album + "'";
			connection.query(sql, function (err, result, fields) 
			{

				var post_ids = ""
				if (result != undefined)
				{
				    for (var i = 0; i < result.length; ++i)
					{
						post_ids = post_ids + "'" + result[i].post_id + "',"
					}
					if (post_ids.length > 0) post_ids = post_ids.substring(0, post_ids.length-1);
				}

					console.log(content);
					var comment_promise_0 = GetComments(0, COMMENT_LIMIT, content[0].post_id, -1)
					comment_promise_0.then(function(response_0) {
						console.log("RESPONSE 0")
						console.log(response_0)
					  var comment_promise_1 = GetComments(1, COMMENT_LIMIT, content[0].post_id, response_0['comment_ids'])
					  comment_promise_1.then(function(response_1) {
					  	  console.log("RESPONSE 1");
					  	  console.log(response_1);
						  var comment_promise_2 = GetComments(2, COMMENT_LIMIT, content[0].post_id, response_1['comment_ids'])
						  comment_promise_2.then(function(response_2) {

						  	  var all_comments = []
						  	  var all_comment_votes = []
						  	  for (var comment of response_0['comments'])
						  	  {
						  	  	  all_comments.push(comment);
						  	  }
						  	  for (var comment of response_1['comments'])
						  	  {
						  	  	  all_comments.push(comment);
						  	  }
						  	  for (var comment of response_2['comments'])
						  	  {
						  	  	  all_comments.push(comment);
						  	  }

						  	  for (var comment_vote of response_0['comment_votes'])
						  	  {
						  	  	  all_comment_votes.push(comment_vote);
						  	  }
						  	  for (var comment_vote of response_1['comment_votes'])
						  	  {
						  	  	  all_comment_votes.push(comment_vote);
						  	  }
						  	  for (var comment_vote of response_2['comment_votes'])
						  	  {
						  	  	  all_comment_votes.push(comment_vote);
						  	  }



						      var data =
							  {
								  data: content[0],
								  comments: all_comments,
								  comment_votes:all_comment_votes,
								  like_state: user_like_state,
							  };
							  console.log("ADGSNGLKSNDKNG");
							  console.log(data);
								var html = renderPage(req.url, data)
								res.send(html);

						  }, function(error_2) {
						  	console.error("Failed!", error_2);
						  })


					  }, function(error_1) {
					  	console.error("Failed!", error_1);
					  })

					}, function(error_0) {
					  console.error("Failed!", error_0);
					})
			});
		});
  	});
});

app.get('/login', function(req, res)
{
	var data = {login_message:""}
	var html = renderPage(req.url, data)
	res.send(html);
});

app.get('/register', function(req, res)
{
	var data = {}
	var html = renderPage(req.url, data)
	res.send(html);
});

app.get('/followers/:user', function (req, res) {
	var follow_sql = "SELECT * FROM follows WHERE followee_id = '" + req.params.user + "'";
	connection.query(follow_sql, function (err, result, fields) 
	{
		var data = 
		{
			followers: result,

		};	
		var html = renderPage(req.url, data)
		res.send(html);
	});
});

app.get('/following/:user', function (req, res) {
	var follow_sql = "SELECT * FROM follows WHERE user_id = '" + req.params.user + "'";
	connection.query(follow_sql, function (err, result, fields) 
	{
		var data = 
		{
			following: result,
		};	
		var html = renderPage(req.url, data)
		res.send(html);
	});
});

setInterval(function () {
    connection.query('SELECT 1');
}, 5000);


module.exports = app;