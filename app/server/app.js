var path = require('path');
var express = require('express');
var ReactDOMServer = require('react-dom/server');
var mysql = require('mysql')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuidv3 = require('uuid/v3');
var Spotify = require('node-spotify-api');

import React from 'react';
const app = express();

const publicPath = express.static(path.join(__dirname, '../'));
const indexPath = path.join(__dirname, '../public/index.html');
import  {BrowserRouter as Router} from 'react-router-dom'

import App from '../components/App.js';
import { StaticRouter } from 'react-router-dom';
import Home from '../components/Home.js';

app.use(publicPath);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 

var POST_LIMIT = 5;
var COMMENT_LIMIT = 5;
var RELEVANT_TIMESTAMP_MAX_AMOUNT = 100;
var SCORE_MODIFIER = 500;
var PRIORITY_MODIFIER = 8640 /2

var score_sql = " " + SCORE_MODIFIER + " * LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (timestamp - CURRENT_TIMESTAMP)/45000 "


var connection = mysql.createConnection({
  host     : 'us-cdbr-iron-east-01.cleardb.net',
  user     : 'bc7ebf9f6de242',
  password : 'aa9b1c1f',
  database : 'heroku_cdc4ca7b10e1680',
  multipleStatements: true
});

function update_replies(parent_id)
{
	if (parent_id == -1) 
	{
		return;
	}
	var update_sql = "UPDATE comments SET replies = replies + 1 WHERE comment_id = '" + parent_id + "'";
	connection.query(update_sql, function (err, result, fields){

		var comment_sql = "SELECT * FROM comments WHERE comment_id = '" + parent_id + "'";
		connection.query(comment_sql, function (err, result, fields)
		{
			if (result != undefined && result.length != 0)
			{
				update_replies(result[0]['parent_comment_id']);
			}
		});

	});
}

function MergeSortPosts(list1, list2, list1_full=false, list2_full=false)
{
	var list1_index = 0;
	var list2_index = 0;
    var merged = [];
    while (true)
	{
		
		if (list1.length == 0)
		{
			merged = list2;
			return [list2, list2_full]
		}
		if (list2.length == 0)
		{
			merged = list1;
			return [list1, list1_full]
		}
		if ((list1_full && list1_index >= list1.length - 1) ||
			(list2_full && list2_index >= list2.length - 1))
		{
			return [merged, true]
		}
		else if (list1_index >= list1.length)
		{
			merged.push(list2.slice(list2_index));
			return [merged, false];
		}
		else if (list2_index >= list2.length)
		{
			merged.push(list1.slice(list1_index));
			return [merged, false];
		}
		else 
		{
	    	if (list1[list1_index]['score'] >= list2[list2_index]['score'])
	    	{
	    		merged.push(list1[list1_index]);
	    		++list1_index;
	    	}
	    	else
	    	{
	    		merged.push(list2[list2_index]);
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
		var followed_users = "";
		if (result != undefined)
		{
			for (var follow of result)
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

		//var score_sql = " " + SCORE_MODIFIER + " * LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (timestamp - CURRENT_TIMESTAMP)/45000 "

		var priority_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN (timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql + " END as score FROM user_content WHERE username in " + followed_users + " OR artist in " + followed_artists + " ORDER BY score DESC LIMIT " + modified_limit + " OFFSET " + offset;
		connection.query(priority_sql, function (err, result, fields) 
			{
			var priority_results = result;
			var sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN (timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql + "  END as score FROM user_content WHERE username NOT in " + followed_users + " AND artist NOT in " + followed_artists + " ORDER BY score DESC LIMIT " + modified_limit + " OFFSET " + non_priority_offset;
			connection.query(sql, function (err, result, fields)  
			{
			    if (err) throw err; 
			    var non_priority_results = result;
				var priority_global_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN (relevant_timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql + " END as score FROM global_posts WHERE artist in " + followed_artists + " AND valid_feed_post != 0 ORDER BY score DESC LIMIT " + modified_limit + " OFFSET " + global_offset;
				connection.query(priority_global_sql, function (err, result, fields) 
				{
					var priority_global_results = result;
					var non_priority_global_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN (relevant_timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql + " END as score FROM global_posts WHERE artist NOT in " + followed_artists + " AND valid_feed_post != 0 ORDER BY score DESC LIMIT " + modified_limit + " OFFSET " + non_priority_global_offset;
					connection.query(non_priority_global_sql, function (err, result, fields) 
					{					

						var non_priority_global_results = result;

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
								post['score'] = post['score'] + PRIORITY_MODIFIER;
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
					    var merged_user = MergeSortPosts(priority_results, non_priority_results, 
					    								 priority_results.length == modified_limit, non_priority_results.length == modified_limit)
					    var merged_priority_global = MergeSortPosts(merged_user[0], priority_global_results,
					    											merged_user[1], priority_global_results.length == modified_limit);
					    var merged_result = MergeSortPosts(merged_priority_global[0], non_priority_global_results,
					    								   merged_priority_global[1], non_priority_global_results.length == modified_limit); 
					    merged_result = merged_result[0]
					    var songs_list = [];
						var post_ids = ""
						var global_post_info = []
					    for (var i =0; i < merged_result.length; ++i)
						{
							songs_list.push(merged_result[i]);
							post_ids = post_ids + "'" + merged_result[i].post_id + "',"
							if (merged_result[i].username == undefined)
							{
								global_post_info.push([merged_result[i].artist, merged_result[i].album, merged_result[i].song, merged_result[i].post_id])
							}
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
											if (result[i][0]["post_id"] != null)
											{
												num_comments_list.push({'count':result[i][0]["COUNT(comment_id)"], 'post_id':result[i][0]["post_id"] });
											}
											
										}
									}	
								}
								var global_num_posts_sql = "";
								var num_posts_list = [];
								for (var i = 0 ; i < global_post_info.length; ++i)
								{
									global_num_posts_sql += "SELECT COUNT(*), post_id FROM user_content WHERE artist = '" + global_post_info[i][0] + "' AND album = '" + global_post_info[i][1] + "' AND song = '" + global_post_info[i][2] + "';"
								}
								connection.query(global_num_posts_sql, function (err, result, fields) 
								{		
									if (result != undefined)
									{
										if (result.length == 1)
										{
											num_posts_list.push({'count':result[0]["COUNT(*)"],'post_id':global_post_info[0][3] });
										}
										else 
										{
											for (i =0; i < result.length; ++i)
											{
												if (result[i][0]["post_id"] != null)
												{
													num_posts_list.push({'count':result[i][0]["COUNT(*)"], 'post_id':global_post_info[i][3] });
												}
												
											}
										}	
									}
									callback(songs_list, likes_list, num_comments_list, num_posts_list);
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
	var data = GetFeed(req, res, 
		function (songs_list, likes_list, num_comments_list, num_posts_list) {
			res.send(
			{
				songs: songs_list,
				likes: likes_list,
				num_comments: num_comments_list,
				num_posts: num_posts_list,
				post_limit: limit,
			});	
		}, 
		parseInt(req.body.offset), 
		parseInt(req.body.non_priority_offset),
		parseInt(req.body.global_offset),
		parseInt(req.body.non_priority_global_offset),
		POST_LIMIT);
}

function RenderFeed(req, res)
{
	var data = GetFeed(req, res, 
		function (songs_list, likes_list, num_comments_list, num_posts_list) {

			// res.render('pages/feed', 
			// {
			// 	songs: songs_list,
			// 	likes: likes_list,
			// 	num_comments: num_comments_list,
			// });	
			var data = {songs: songs_list,
						likes: likes_list,
						num_comments: num_comments_list,
						num_posts: num_posts_list,
					    username: req.cookies.username}
			//var html = ReactDOMServer.renderToString(<StaticRouter location={req.url} context={context}><App data = {data}/></StaticRouter>)
			//var html = ReactDOMServer.renderToString(<Home test= "testing"/>)
			var html = renderPage(req.url, data);
			res.send(html);

		}, 
		0, 
		0,
		0,
		0,
		POST_LIMIT);

}

function GetCommentChildren(comment_ids, comments, comment_votes, username, res, offset=  0)
{
	var comment_sql = "SELECT *, ((upvotes + 1.9208) / (upvotes + downvotes) - 1.96 * SQRT((upvotes * downvotes) / (upvotes + downvotes) + 0.9604) / (upvotes + downvotes)) / (1 + 3.8416 / (upvotes + downvotes)) AS order_score FROM comments WHERE parent_comment_id in (" + comment_ids + ") ORDER by order_score DESC LIMIT 18446744073709551615 OFFSET " + offset;
	connection.query(comment_sql, function (err, result, fields) 
	{
		if (result == undefined)
		{
			res.send({comments:comments,
					  comment_votes:comment_votes});
		}
		
		else
		{
			var comment_result = result;
			var comment_votes_sql = "SELECT comment_id, vote_state FROM comment_votes WHERE comment_id in (" + comment_ids + ") and user_id = '" + username + "'";
			connection.query(comment_votes_sql, function(err, result, fields)
			{
				comment_ids = ""
				for (var comment of comment_result)
				{
					comments.push(comment);
					if (comment_ids.length != 0)
					{
						comment_ids += ", ";
					}
					comment_ids += "'" + comment.comment_id + "'";
				}

				for (var comment_vote of result)
				{
					comment_votes.push(comment_vote)
				}
				GetCommentChildren(comment_ids, comments, comment_votes, username, res)				
			});

		}
	});
}

function GetCommentsFromComments(limit, comment_ids, username, offset = 0, post_specific = true)
{
	limit = limit -2
	return new Promise(function(resolve, reject) {
		var sql = ""
		if (comment_ids != undefined && comment_ids.length > 0) 
			{

			for (var i = 0; i < comment_ids.length; ++i)
			{
				sql += "SELECT *, ((upvotes + 1.9208) / (upvotes + downvotes) - 1.96 * SQRT((upvotes * downvotes) / (upvotes + downvotes) + 0.9604) / " + 
					  "(upvotes + downvotes)) / (1 + 3.8416 / (upvotes + downvotes)) AS order_score FROM comments WHERE parent_comment_id = " + String(comment_ids[i]) +
					  " ORDER by order_score DESC LIMIT " + limit + 
					  " OFFSET " + offset;
				sql += "; "
			}
			connection.query(sql, function (err, result, fields) 
			{
				var comment_ids_list = []
				var comment_ids = "";
				var comment_list = [];
				if (result != undefined)
				{
					for (var i = 0; i < result.length; ++i)
					{
						if (result[i] != [] && result[i][0] != undefined)
						{
							if (result[i][0]['order_score'] == undefined)
							{
								result[i][0]['order_score'] = 0;
							}
							for (var j = 0; j < result[i].length; ++j)
							{
								comment_list.push(result[i][0]);
								comment_ids += "'";
								comment_ids = comment_ids + result[i][0].comment_id + "',"
								comment_ids_list.push("'" + result[i][j].comment_id + "'")

							}

						}
					}
				}
				comment_ids = comment_ids.substring(0, comment_ids.length-1)
				var comment_votes_sql = "SELECT comment_id, vote_state FROM comment_votes WHERE comment_id in (" + comment_ids + ") and user_id = '" + username + "'";
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
							comment_ids:comment_ids_list,
						});
					}
				});
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
}

function GetComments(level, limit, post_id, comment_ids, username, offset = 0, post_specific = true)
{
	return new Promise(function(resolve, reject) {

		var sql = "SELECT *, ((upvotes + 1.9208) / (upvotes + downvotes) - 1.96 * SQRT((upvotes * downvotes) / (upvotes + downvotes) + 0.9604) / (upvotes + downvotes)) / (1 + 3.8416 / (upvotes + downvotes)) AS order_score FROM comments WHERE post_id = '" + String(post_id) +"'  AND comment_level = " + level + " AND parent_comment_id in (" + comment_ids + ") ORDER by order_score DESC LIMIT " + limit + " OFFSET " + offset;
		if (!post_specific)
		{
			sql = "SELECT *, ((upvotes + 1.9208) / (upvotes + downvotes) - 1.96 * SQRT((upvotes * downvotes) / (upvotes + downvotes) + 0.9604) / (upvotes + downvotes)) / (1 + 3.8416 / (upvotes + downvotes)) AS order_score FROM comments WHERE comment_level = " + level + " AND parent_comment_id in (" + comment_ids + ") ORDER by order_score DESC LIMIT " + limit + " OFFSET " + offset;
		}
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
				comment_ids = comment_ids.substring(0, comment_ids.length-1)
				var comment_votes_sql = "SELECT comment_id, vote_state FROM comment_votes WHERE comment_id in (" + comment_ids + ") and user_id = '" + username + "'";
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

// function GetCommentsFromPost(limit, post_id, comment_ids, username, offset = 0)
// {
// 	return new Promise(function(resolve, reject) {

// 		var sql = "SELECT *, ((upvotes + 1.9208) / (upvotes + downvotes) - 1.96 * SQRT((upvotes * downvotes) / (upvotes + downvotes) + 0.9604) / " + 
// 				  "(upvotes + downvotes)) / (1 + 3.8416 / (upvotes + downvotes)) AS order_score FROM comments WHERE post_id in " + String(post_id) +
// 				  "  AND comment_level = 0 ORDER by order_score DESC LIMIT " + limit + 
// 				  " OFFSET " + offset;
// 		connection.query(sql, function (err, result, fields) 
// 		{
// 			var comment_ids = "";
// 			var comment_list = [];
// 			if (result != undefined)
// 			{
// 				for (var i = 0; i < result.length; ++i)
// 				{
// 					if (result[i]['order_score'] == undefined)
// 					{
// 						result[i]['order_score'] = 0;
// 					}
// 					comment_list.push(result[i]);
// 					comment_ids += "'";
// 					comment_ids = comment_ids + result[i].comment_id + "',"
// 				}
// 			}
// 			if (comment_ids.length > 0) 
// 			{
// 				comment_ids = comment_ids.substring(0, comment_ids.length-1)
// 				var comment_votes_sql = "SELECT comment_id, vote_state FROM comment_votes WHERE comment_id in (" + comment_ids + ") and user_id = '" + username + "'";
// 				connection.query(comment_votes_sql, function (err, result, fields) 
// 				{
// 					var comment_votes_list = [];
// 					var post_ids = ""
// 					if (result != undefined)
// 					{
// 					    for (i =0; i < result.length; ++i)
// 						{
// 							comment_votes_list.push(result[i]);	
// 						}
// 						resolve({
// 							comments: comment_list,
// 							comment_votes:comment_votes_list,
// 							comment_ids:comment_ids,
// 						});
// 					}
// 				});
// 			}
// 			else
// 			{
// 				resolve({
// 					comments: [],
// 					comment_votes:[],
// 				});
// 			}
// 		});
// 	});
// }

function GetCommentsFromPost(limit, post_id, comment_ids, username, offset = 0)
{
	limit = limit - 2
	return new Promise(function(resolve, reject) {

		var sql = ""
		for (var i = 0; i < post_id.length; ++i)
		{
			sql += "SELECT *, ((upvotes + 1.9208) / (upvotes + downvotes) - 1.96 * SQRT((upvotes * downvotes) / (upvotes + downvotes) + 0.9604) / " + 
				  "(upvotes + downvotes)) / (1 + 3.8416 / (upvotes + downvotes)) AS order_score FROM comments WHERE post_id = " + String(post_id[i]) +
				  "  AND comment_level = 0 ORDER by order_score DESC LIMIT " + limit + 
				  " OFFSET " + offset;
			sql += "; "
		}
		connection.query(sql, function (err, result, fields) 
		{
			var comment_ids = "";
			var comment_ids_list = []
			var comment_list = [];
			if (result != undefined)
			{
				for (var i = 0; i < result.length; ++i)
				{
					if (result[i] != [] && result[i][0] != undefined)
					{
						if (result[i][0]['order_score'] == undefined)
						{
							result[i][0]['order_score'] = 0;
						}
						for (var j = 0; j < result[i].length; ++j)
						{
							comment_list.push(result[i][j]);
							comment_ids += "'";
							comment_ids = comment_ids + result[i][j].comment_id + "',"
							comment_ids_list.push("'" + result[i][j].comment_id + "'")
						}

					}
				}
			}
			if (comment_ids.length > 0) 
			{
				comment_ids = comment_ids.substring(0, comment_ids.length-1)
				var comment_votes_sql = "SELECT comment_id, vote_state FROM comment_votes WHERE comment_id in (" + comment_ids + ") and user_id = '" + username + "'";
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
							comment_ids:comment_ids_list,
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
	return html;
}

var context = {};

// app.post('/register', function(req, res)
// {
// 	if (req.body.password == req.body.password_confirm)
// 	{
// 		var sql = "INSERT INTO accounts (username, password) VALUES ('" + req.body.username + "', '" + req.body.password + "')";
// 		connection.query(sql, function (err, result) {
// 	    	if (err) throw err;
//   		});
// 	}
// 	//res.send();
// }); 



app.get('/', (req, res) => {
	RenderFeed(req, res);

})

app.get('/contact', (req, res) => {
	var html = renderPage(req.url, {username: req.cookies.username});
	res.send(html);
})

app.get('/about', (req, res) => {
	var html = renderPage(req.url, {username: req.cookies.username});
	res.send(html);
})

app.get('/user/:user/:post_id', function (req, res) {
	var sql = "SELECT * FROM user_content WHERE username = '" + req.params.user + "'" + " AND id = '" + req.params.post_id + "'";
	connection.query(sql, function (err, result, fields) 
	{
		var user_post = result;
		var current_post_id = "";

		var like_post_id = "";
		if (result.length != 0)
		{
			like_post_id = result[0].post_id;
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

			var num_comments_sql = "SELECT COUNT(comment_id) FROM comments WHERE post_id = '" + req.params.post_id + "'"
			connection.query(num_comments_sql, function (err, result, fields) 
			{	
				var num_comments;
				if (result != undefined)
				{
					num_comments = result[0]['COUNT(comment_id)'];
				}
				var comment_promise_0 = GetComments(0, COMMENT_LIMIT, req.params.post_id, -1, req.cookies.username)
				comment_promise_0.then(function(response_0) {
				  var comment_promise_1 = GetComments(1, COMMENT_LIMIT, req.params.post_id, response_0['comment_ids'], req.cookies.username)
				  comment_promise_1.then(function(response_1) {
					  var comment_promise_2 = GetComments(2, COMMENT_LIMIT, req.params.post_id, response_1['comment_ids'], req.cookies.username)
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
							  like_state:user_like_state,
							  username: req.cookies.username,
							  num_comments:num_comments,
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
	});
});

function GetPosts(condition, req, res, limit = 0)
{
	var sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN " + 
								  "(timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql + " END as score FROM user_content " + condition + 
								  " ORDER BY score DESC LIMIT " + limit + " OFFSET " + req.body.offset;
	connection.query(sql, function (err, result, fields) 
	{					
	    var PRIORITY_MODIFIER = 2
	    var songs_list = [];
		var post_ids = ""
	    for (var i =0; i < result.length; ++i)
		{
			songs_list.push(result[i]);
			post_ids = post_ids + "'" + result[i].post_id + "',"
		}
		if (post_ids.length > 0) post_ids = post_ids.substring(0, post_ids.length-1);

		var like_sql = "SELECT post_id, like_state FROM likes WHERE user_id = '" + 
						req.params.username + "'" + "AND post_id in (" + post_ids + ")";
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
							if (result[i][0]["post_id"] != null)
							{
								num_comments_list.push({'count':result[i][0]["COUNT(comment_id)"], 'post_id':result[i][0]["post_id"] });
							}
							
						}
					}	
				}
				var user_sql = "SELECT * FROM accounts WHERE username = '" + req.params.user +"'";
				connection.query(user_sql, function (err, result, fields) 
				{
					//callback(songs_list, likes_list, num_comments_list);
					var data = {
						songs: songs_list,
						likes: likes_list,
						num_comments: num_comments_list,
						username: req.body.username,
						user: result[0],
					}
					//var html = renderPage(req.url, data)
					//res.send(html);
					res.send(data);
			 	});
				//callback(data);
			});			
		});
	});
}

app.post('/load_post_data', function (req, res) {
	GetPosts("WHERE username = '" + req.body.user + "' ", req, res, 5);
});


app.get('/user/:user/', (req, res) => {
	//var sql = "SELECT * FROM user_content where username = '" + req.params.user + "'ORDER BY timestamp ";
	//var score_sql = " " + SCORE_MODIFIER + " * LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (timestamp - CURRENT_TIMESTAMP)/45000 "
	var sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN " + 
								  "(timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql + " END as score FROM user_content " + 
								  "WHERE username = '" + req.params.user + "' " + 
								  "ORDER BY score DESC LIMIT " + 5 + " OFFSET " + 0
	connection.query(sql, function (err, result, fields) 
	{
	    if (err) throw err;
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
					//user_id = '" + req.cookies.username + "'" + "AND
					num_comments_sql = num_comments_sql + "SELECT COUNT(comment_id), post_id FROM comments WHERE post_id =" + id + " UNION " ;
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
							var data = {
								songs: songs_list,
								likes: likes_list,
								num_comments: num_comments_list,
								follows: follows_data,
								followees: followees,
								user: result[0],
								username: req.cookies.username,
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

app.post('/submit_description', function(req, res)
{
	var user_search_sql = "UPDATE accounts SET description = '" + req.body.text + "' WHERE username = '" + req.body.user + "'";
	connection.query(user_search_sql, function (err, result, fields){
		res.send({nothing:0});
	});
})

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
			var album_post_data = AggregateLikes(num_album_comments_list, album_data, []);
			var ordered_song_data = SortPosts(album_post_data);
			var ordered_albums = OrderPosts(ordered_song_data, album_data);
			var song_sql = "SELECT * from global_posts WHERE artist = '" + req.params.artist + "' AND song != 'NO_SONG_ALBUM_ONLY'";
			var song_post_ids = "";
			connection.query(song_sql, function (err, result, fields) 
			{
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

					var follow_sql = "SELECT * FROM follows WHERE followee_id = '" + req.params.artist + "'";
					connection.query(follow_sql, function (err, result, fields) 
					{
						var follows_data = result;

						var data = {
							artist: req.params.artist,
							album_data: ordered_albums,
							song_data: ordered_songs,
							username: req.cookies.username,
							follows: follows_data,
						}	
						var html = renderPage(req.url, data)
						res.send(html);
					});
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
				username: req.cookies.username,
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
				username: req.cookies.username,
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
		else
		{
			var data = 
			{
				global_post: undefined,
				comments: undefined,
				comment_votes:undefined,
				like_state: undefined,
				username: req.cookies.username,
				user_posts: undefined,
			};
			var html = renderPage(req.url, data)
			res.send(html);
			return;
		}

		//var score_sql = " " + SCORE_MODIFIER + " * LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (timestamp - CURRENT_TIMESTAMP)/45000 "
		var user_posts_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN " + 
							  "(timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql+ " END as score FROM user_content " + 
							  "WHERE artist = '" + req.params.artist + "' AND song = '" + req.params.song + "' " + 
							  "ORDER BY score DESC LIMIT " + 5 + " OFFSET " + 0;
		connection.query(user_posts_sql, function (err, result, fields) 
		{		
			var user_posts = result;
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
				var comment_promise_0 = GetCommentsFromPost(COMMENT_LIMIT, post_ids, -1, req.cookies.username)
				comment_promise_0.then(function(response_0) {
				  var comment_promise_1 = GetCommentsFromComments(COMMENT_LIMIT, response_0['comment_ids'], req.cookies.username, 0, false)
				  comment_promise_1.then(function(response_1) {
					  var comment_promise_2 = GetCommentsFromComments(COMMENT_LIMIT, response_0['comment_ids'], req.cookies.username, 0, false)
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
								global_post: content[0],
								comments: all_comments,
								comment_votes:all_comment_votes,
								like_state: user_like_state,
								username: req.cookies.username,
								user_posts: user_posts
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
});

app.post('/load_global_posts', function(req, res)
{
	//var score_sql = " " + SCORE_MODIFIER + " * LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (timestamp - CURRENT_TIMESTAMP)/45000 "
	var user_posts_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN " + 
						  "(timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql + " END as score FROM user_content " + 
						  "WHERE artist = '" + req.body.artist + "' AND album = '" + req.body.album + "' AND song = '" + req.body.song + "' " + 
						  "ORDER BY score DESC LIMIT " + 5 + " OFFSET " + req.body.offset;
	connection.query(user_posts_sql, function (err, result, fields) 
	{		
		var user_posts = result;
		var post_ids = []
		if (result != undefined)
		{
			var songs_list = []
		    for (var i = 0; i < result.length; ++i)
			{
				songs_list.push(result[i]);
				post_ids.push("'" + result[i].post_id + "'")
			}
			//if (post_ids.length > 0) post_ids = post_ids.substring(0, post_ids.length-1);
		}
		var comment_promise_0 = GetCommentsFromPost(COMMENT_LIMIT, post_ids, -1, req.cookies.username)
		comment_promise_0.then(function(response_0) {
		  var comment_promise_1 = GetCommentsFromComments(COMMENT_LIMIT, response_0['comment_ids'], req.cookies.username, 0, false)
		  comment_promise_1.then(function(response_1) {
			  var comment_promise_2 = GetCommentsFromComments(COMMENT_LIMIT, response_0['comment_ids'], req.cookies.username, 0, false)
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
						comments: all_comments,
						comment_votes:all_comment_votes,
						username: req.cookies.username,
						user_posts: user_posts
					};
					// var html = renderPage(req.url, data)
					// res.send(html);
					res.send(data);
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


app.get('/album/:artist/:album', function (req, res) {

	//var score_sql = " " + SCORE_MODIFIER + " * LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (timestamp - CURRENT_TIMESTAMP)/45000 "
	var user_posts_sql = "SELECT *, CASE WHEN cast(likes as signed) - cast(dislikes as signed) = 0 THEN " + 
						  "(timestamp - CURRENT_TIMESTAMP)/45000 ELSE " + score_sql + " END as score FROM user_content " + 
						  "WHERE artist = '" + req.params.artist + "' AND album = '" + req.params.album + "' AND song = 'NO_SONG_ALBUM_ONLY' " + 
						  "ORDER BY score DESC LIMIT " + 5 + " OFFSET " + 0;
	connection.query(user_posts_sql, function (err, result, fields) 
	{		
		var user_posts = result;
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
		var sql = "SELECT * FROM global_posts WHERE artist = '" + req.params.artist + "'" + " AND album = '" + req.params.album + "' AND type = 1";
		connection.query(sql, function (err, result, fields) 
		{

			var content = result;

			if (result.length == 0)
			{

				var data = 
				{
					global_post: undefined,
					comments: undefined,
					comment_votes:undefined,
					like_state: undefined,
					username: req.cookies.username,
					user_posts: undefined,
				};
				var html = renderPage(req.url, data)
				res.send(html);
				return
			}



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

					var post_ids = []
					if (result != undefined)
					{
					    for (var i = 0; i < result.length; ++i)
						{
							post_ids.push("'" + result[i].post_id + "'")
						}
						//if (post_ids.length > 0) post_ids = post_ids.substring(0, post_ids.length-1);
					}
					var comment_promise_0 = GetCommentsFromPost(COMMENT_LIMIT, post_ids, -1, req.cookies.username)
					comment_promise_0.then(function(response_0) {

					  var comment_promise_1 = GetCommentsFromComments(COMMENT_LIMIT, response_0['comment_ids'], req.cookies.username, 0, false)
					  comment_promise_1.then(function(response_1) {
						  var comment_promise_2 = GetCommentsFromComments(COMMENT_LIMIT, response_1['comment_ids'], req.cookies.username, 0, false)
						  comment_promise_2.then(function(response_2) {

						// var comment_promise_0 = GetComments(0, COMMENT_LIMIT, content[0].post_id, -1, req.cookies.username)
						// comment_promise_0.then(function(response_0) {
						//   var comment_promise_1 = GetComments(1, COMMENT_LIMIT, content[0].post_id, response_0['comment_ids'], req.cookies.username)
						//   comment_promise_1.then(function(response_1) {
						// 	  var comment_promise_2 = GetComments(2, COMMENT_LIMIT, content[0].post_id, response_1['comment_ids'], req.cookies.username)
						// 	  comment_promise_2.then(function(response_2) {

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
								  global_post: content[0],
								  comments: all_comments,
								  comment_votes:all_comment_votes,
								  like_state: user_like_state,
								  username: req.cookies.username,
								  user_posts: user_posts
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
  	});
});


app.get('/login', function(req, res)
{
	var data = {login_message:""}
	var html = renderPage(req.url, data)
	res.send(html);
});

app.post('/login', function(req, res)
{
	var sql = "SELECT * FROM accounts where username = '" + req.body.username + "' AND password = '"+ req.body.password +"' COLLATE utf8_bin";
	connection.query(sql, function (err, result, fields) {
	    if (err) throw err;
	    var login_message = "Login Failure";
	    if (result.length!= 0)
	    {
			res.cookie('username', result[0].username);
			var data = {login_message:"Login Successful"}
			res.send(data);			
	    }
	    else
	    {
			var data = {login_message:"Login Failed"}
			res.send(data);
	    }

  	});
});

app.post('/logout', function(req, res)
{
	res.clearCookie('username')
	res.send({data:1})
});


app.get('/register', function(req, res)
{
	var data = {username: req.cookies.username}
	var html = renderPage(req.url, data)
	res.send(html);
});

app.post('/register', function(req, res)
{
	if (req.body.password == req.body.password_confirm)
	{
		var username_check_sql = "SELECT * from accounts WHERE username = '" + req.body.username + "'";
		var data;
		connection.query(username_check_sql, function (err, result) {
			if (result.length == 0)
			{
				var sql = "INSERT INTO accounts (username, password, email) VALUES ('" + req.body.username + "', '" + req.body.password + "', '" + req.body.email + "' )";
				connection.query(sql, function (err, result) {
			    	if (err) throw err;
		  		});
		  		data = {
					message: "Registration Successful"
				}
				res.cookie('username', req.body.username);
		  		res.send(data);			
			}
			else
			{
		  		data = {
					message: "Username already taken"
				}
				res.send(data);
			}
		});
	}
	else
	{
		data = {
			message: "Passwords don't match"
		}
		res.send(data)
	}
	
}); 

app.get('/followers/:user', function (req, res) {
	var follow_sql = "SELECT * FROM follows WHERE followee_id = '" + req.params.user + "'";
	connection.query(follow_sql, function (err, result, fields) 
	{
		var data = 
		{
			followers: result,
			username: req.cookies.username,
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
			username: req.cookies.username,
		};	
		var html = renderPage(req.url, data)
		res.send(html);
	});
});

app.post('/follow', function (req, res)
{

	var date = String(new Date().getTime());
	var check_sql = "SELECT * from follows where user_id = '" + req.cookies.username + "' AND followee_id = '" + req.body.followee_id + "'";
	connection.query(check_sql, function (err, result, fields){
		if (result.length != 0)
		{
			var follow_sql = "DELETE from follows WHERE user_id = '" + req.cookies.username + "' AND followee_id = '"+ req.body.followee_id + "'";
			connection.query(follow_sql, function (err, result, fields){
				res.send({})
			});			
				
		} else 
		{
			var follow_sql = "INSERT into follows (timestamp, user_id, followee_id, type) VALUES(" + date + ", '" + req.cookies.username + "', '"+ req.body.followee_id + "'," + req.body.type + ")"
			connection.query(follow_sql, function (err, result, fields){
				res.send({})
			});							
		}
	});
});

app.post('/like', function (req, res)
{
	var sql = "UPDATE user_content SET likes = likes + 1 WHERE post_id = '" + req.body.id + "'";
	var user_sql = "UPDATE accounts SET upvotes = upvotes + 1 WHERE username = '" + req.body.user + "'";
	var modify_sql = "INSERT INTO likes (post_id, user_id, like_state) VALUES('" + req.body.id + "', '" + req.cookies.username + "'," + '1' + ")";
	var sql_check = "SELECT like_state FROM likes WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
	var like_state = 1;
	connection.query(sql_check, function (err, result, fields) 
	{
		if (result.length != 0)
		{
			if (result[0]['like_state'] == 1)
			{
				//already liked post
				user_sql = "UPDATE accounts SET upvotes = upvotes - 1 WHERE username = '" + req.body.user + "'";
				sql = "UPDATE user_content SET likes = likes - 1 WHERE post_id = '" + req.body.id + "'";
				modify_sql = "DELETE FROM likes WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
				like_state = -1
			}
			else 
			{
				//already unliked post
				user_sql = "UPDATE accounts SET upvotes = upvotes + 1 WHERE username = '" + req.body.user + "';" +
							"UPDATE accounts SET downvotes = downvotes - 1 WHERE username = '" + req.body.user + "'";
				sql = "UPDATE user_content SET likes = likes + 1 WHERE post_id = '" +  req.body.id + "';" + 
					  "UPDATE user_content SET dislikes = dislikes - 1 WHERE post_id = '" + req.body.id + "'";
				modify_sql = "UPDATE likes SET like_state = 1 WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
				like_state = 1
			}
		}			
		connection.query(modify_sql, function (err, result, fields){
			connection.query(sql, function (err, result, fields){
				connection.query(user_sql, function (err, result, fields){
					var data_sql = "SELECT likes, dislikes FROM user_content WHERE post_id = '" + req.body.id + "'";
					connection.query(data_sql, function (err, result, fields) 
					{
						var likes_score = 0;
						if (result.length != 0)
						{
							likes_score = result[0].likes -  result[0].dislikes;
							res.send({likes_score: likes_score,
									  like_state: like_state})
						}

					});

				});
			});
		});
	});
});

app.post('/dislike', function (req, res)
{
	var sql = "UPDATE user_content SET dislikes = dislikes + 1 WHERE post_id = '" + req.body.id + "'";
	var user_sql = "UPDATE accounts SET downvotes = downvotes + 1 WHERE username = '" + req.body.user + "'";
	var modify_sql = "INSERT INTO likes (post_id, user_id, like_state) VALUES('" + req.body.id + "', '" + req.cookies.username + "'," + '0' + ")";
	var sql_check = "SELECT like_state FROM likes WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
	var like_state = 0;
	connection.query(sql_check, function (err, result, fields) 
	{
		if (result.length != 0)
		{
			if (result[0]['like_state'] == 0)
			{
				//already unliked post
				user_sql = "UPDATE accounts SET downvotes = downvotes - 1 WHERE username = '" + req.body.user + "'";
				sql = "UPDATE user_content SET dislikes = dislikes - 1 WHERE post_id = '" + req.body.id + "'";
				modify_sql = "DELETE FROM likes WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
				like_state = -1;
			}
			else 
			{
				//already liked post
				user_sql = "UPDATE accounts SET upvotes = upvotes - 1 WHERE username = '" + req.body.user + "';" +
							"UPDATE accounts SET downvotes = downvotes + 1 WHERE username = '" + req.body.user + "'";
				sql = "UPDATE user_content SET likes = likes - 1 WHERE post_id = '" +  req.body.id + "';" + 
					  "UPDATE user_content SET dislikes = dislikes + 1 WHERE post_id ='" + req.body.id + "'";
				modify_sql = "UPDATE likes SET like_state = 0 WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
				like_state = 0;
			}
		}			
		connection.query(modify_sql, function (err, result, fields){
			connection.query(sql, function (err, result, fields){
				connection.query(user_sql, function (err, result, fields){
					var data_sql = "SELECT likes, dislikes FROM user_content WHERE post_id = '" + req.body.id + "'";
					connection.query(data_sql, function (err, result, fields) 
					{
						var likes_score = 0;
						if (result.length != 0)
						{
							likes_score = result[0].likes -  result[0].dislikes;
							res.send({likes_score: likes_score,
									  like_state: like_state})
						}			
					});
				});
			});
		});
	});
});

app.post('/global_like', function (req, res)
{
	var sql = "UPDATE global_posts SET likes = likes + 1 WHERE post_id = '" + req.body.id + "'";
	var modify_sql = "INSERT INTO likes (post_id, user_id, like_state) VALUES('" + req.body.id + "', '" + req.cookies.username + "'," + '1' + ")";
	var sql_check = "SELECT like_state FROM likes WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
	var like_state = 1;
	connection.query(sql_check, function (err, result, fields) 
	{
		if (result.length != 0)
		{
			if (result[0]['like_state'] == 1)
			{
				//already liked post
				sql = "UPDATE global_posts SET likes = likes - 1 WHERE post_id = '" + req.body.id + "';";
				modify_sql = "DELETE FROM likes WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
				like_state = -1
			}
			else 
			{
				//already unliked post
				sql = "UPDATE global_posts SET dislikes = dislikes - 1 WHERE post_id = '" +  req.body.id + "';" + 
					  "UPDATE global_posts SET likes = likes + 1 WHERE post_id = '" +  req.body.id + "'";
				modify_sql = "UPDATE likes SET like_state = 1 WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
				like_state = 1
			}
		}			
		connection.query(modify_sql, function (err, result, fields){
			connection.query(sql, function (err, result, fields){
				//RenderFeed(req, res);
				var timestamp = String(new Date().getTime());
				var relevant_timestamp_sql = "UPDATE global_posts set relevant_timestamp = CASE" + 
												" WHEN likes + dislikes = 0 THEN " + timestamp + 
												" WHEN relevant_timestamp + (" + timestamp + "- relevant_timestamp) / (0.5 * (((likes + dislikes) + " + RELEVANT_TIMESTAMP_MAX_AMOUNT + ") - ABS((likes + dislikes) - " + RELEVANT_TIMESTAMP_MAX_AMOUNT + "))) > " + timestamp + " THEN " + timestamp + 
												" ELSE relevant_timestamp + (" + timestamp + " - relevant_timestamp) / (0.5 * (((likes + dislikes) + " + RELEVANT_TIMESTAMP_MAX_AMOUNT + ") - ABS((likes + dislikes) - " + RELEVANT_TIMESTAMP_MAX_AMOUNT + "))) END " +
											" WHERE post_id = '" + req.body.id + "'";
				connection.query(relevant_timestamp_sql, function (err, result, fields){
					var data_sql = "SELECT likes, dislikes FROM global_posts WHERE post_id = '" + req.body.id + "'";
					connection.query(data_sql, function (err, result, fields) 
					{
						var likes_score = 0;
						if (result.length != 0)
						{
							likes_score = result[0].likes -  result[0].dislikes;
							res.send({likes_score: likes_score,
									  like_state: like_state})
						}				
					});
				});
			});
		});
	});
});

app.post('/global_dislike', function (req, res)
{
	var sql = "UPDATE global_posts SET dislikes = dislikes + 1 WHERE post_id = '" + req.body.id + "'";
	var modify_sql = "INSERT INTO likes (post_id, user_id, like_state) VALUES('" + req.body.id + "', '" + req.cookies.username + "'," + '0' + ")";
	var sql_check = "SELECT like_state FROM likes WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
	var like_state = 0
	connection.query(sql_check, function (err, result, fields) 
	{
		if (result.length != 0)
		{
			if (result[0]['like_state'] == 0)
			{
				//already unliked post
				sql = "UPDATE global_posts SET dislikes = dislikes - 1 WHERE post_id = '" + req.body.id +"'";
				modify_sql = "DELETE FROM likes WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
				like_state = -1
			}
			else 
			{
				//already liked post
				sql = "UPDATE global_posts SET dislikes = dislikes + 1 WHERE post_id = '" +  req.body.id + "' ;" + 
					  "UPDATE global_posts SET likes = likes - 1 WHERE post_id = '" +  req.body.id + "'";
				modify_sql = "UPDATE likes SET like_state = 0 WHERE user_id = '" + req.cookies.username + "' AND post_id = '" + req.body.id + "'";
				like_state = 0
			}
		}			

		connection.query(modify_sql, function (err, result, fields){
			connection.query(sql, function (err, result, fields){
				//RenderFeed(req, res);
				var timestamp = String(new Date().getTime());



				var relevant_timestamp_sql = "UPDATE global_posts set relevant_timestamp = CASE" + 
												" WHEN likes + dislikes = 0 THEN " + timestamp + 
												" WHEN relevant_timestamp + (" + timestamp + "- relevant_timestamp) / (0.5 * (((likes + dislikes) + " + RELEVANT_TIMESTAMP_MAX_AMOUNT + ") - ABS((likes + dislikes) - " + RELEVANT_TIMESTAMP_MAX_AMOUNT + "))) > " + timestamp + " THEN " + timestamp + 
												" ELSE relevant_timestamp + (" + timestamp + " - relevant_timestamp) / (0.5 * (((likes + dislikes) + " + RELEVANT_TIMESTAMP_MAX_AMOUNT + ") - ABS((likes + dislikes) - " + RELEVANT_TIMESTAMP_MAX_AMOUNT + "))) END " +
											" WHERE post_id = '" + req.body.id + "'";
				connection.query(relevant_timestamp_sql, function (err, result, fields){
					var data_sql = "SELECT likes, dislikes FROM global_posts WHERE post_id = '" + req.body.id + "'";
					connection.query(data_sql, function (err, result, fields) 
					{
						var likes_score = 0;
						if (result.length != 0)
						{
							likes_score = result[0].likes -  result[0].dislikes;
							res.send({likes_score: likes_score,
									  like_state: like_state})
						}				
					});
				});
			});
		});
	});
});

app.post('/upvote', function (req, res)
{
	var sql = "UPDATE comments SET upvotes = upvotes + 1 WHERE comment_id = '" +  req.body.id +"'"
	var modify_sql = "INSERT INTO comment_votes (comment_id, user_id, vote_state) VALUES('" + req.body.id + "', '" + req.cookies.username + "'," + '1' + ")";
	var sql_check = "SELECT vote_state FROM comment_votes WHERE user_id = '" + req.cookies.username + "' AND comment_id = '" + req.body.id + "'";
	connection.query(sql_check, function (err, result, fields) 
	{
		if (result.length != 0)
		{
			if (result[0]['vote_state'] == 1)
			{
				//already liked post
				sql = "UPDATE comments SET upvotes = upvotes - 1 WHERE comment_id = '" + req.body.id + "'";
				modify_sql = "DELETE FROM comment_votes WHERE user_id = '" + req.cookies.username + "' AND comment_id = '" + req.body.id + "'";
			}
			else 
			{
				//already unliked post
				sql = "UPDATE comments SET upvotes = upvotes + 1 WHERE comment_id = '" +  req.body.id +"';" + 
					  "UPDATE comments SET downvotes = downvotes - 1 WHERE comment_id = '" + req.body.id + "'";
				modify_sql = "UPDATE comment_votes SET vote_state = 1 WHERE user_id = '" + req.cookies.username + "' AND comment_id = '" + req.body.id + "'";
			}
		}			
		connection.query(modify_sql, function (err, result, fields){
			connection.query(sql, function (err, result, fields){
				res.send({})
			});
		});
	});
});

app.post('/downvote', function (req, res)
{
	var sql = "UPDATE comments SET downvotes = downvotes + 1 WHERE comment_id = '" +  req.body.id +"'";
	var modify_sql = "INSERT INTO comment_votes (comment_id, user_id, vote_state) VALUES('" + req.body.id + "', '" + req.cookies.username + "'," + '0' + ")";
	var sql_check = "SELECT vote_state FROM comment_votes WHERE user_id = '" + req.cookies.username + "' AND comment_id = '" + req.body.id +"'";
	connection.query(sql_check, function (err, result, fields) 
	{

		if (result.length != 0)
		{
			if (result[0]['vote_state'] == 0)
			{
				//already unliked post
				sql = "UPDATE comments SET downvotes = downvotes - 1 WHERE comment_id = '" + req.body.id + "'";
				modify_sql = "DELETE FROM comment_votes WHERE user_id = '" + req.cookies.username + "' AND comment_id = '" + req.body.id + "'";
			}
			else 
			{
				//already liked post
				sql = "UPDATE comments SET upvotes = upvotes - 1 WHERE comment_id = '" +  req.body.id + "';" + 
					  "UPDATE comments SET downvotes = downvotes + 1 WHERE comment_id = '" + req.body.id + "'";
				modify_sql = "UPDATE comment_votes SET vote_state = 0 WHERE user_id = '" + req.cookies.username + "' AND comment_id = '" + req.body.id +"'";
			}
		}			
		connection.query(modify_sql, function (err, result, fields){
			connection.query(sql, function (err, result, fields){
				//RenderFeed(req, res);
				res.send({})
				//res.send({id: req.body.id, state:/'[0]['like_state'],})
			});
		});
	});
});

app.post('/comment', function (req, res)
{
	var timestamp = String(new Date().getTime());
	var comment_id = uuidv3(String("comment/" + req.cookies.username + "/" + timestamp), uuidv3.URL);
	var sql = "INSERT INTO comments (post_id, user_id, text, timestamp, comment_id, parent_comment_id, comment_level) values('" + req.body.id + "','" + req.cookies.username + "','" + req.body.text + "', "  + timestamp + ",'" + comment_id + "','" + req.body.parent_comment_id + "'," + req.body.comment_level + ")";
	connection.query(sql, function (err, result, fields){


		update_replies(req.body.parent_comment_id);

		res.send({comment_id:comment_id,
				  timestamp:timestamp,
				  username: res.req.cookies.username});

	});
});

app.post('/show_replies', function (req, res)
{
	GetCommentChildren("'" + req.body.id + "'",[], [], req.cookies.username, res, req.body.offset)
});

app.post('/load_comments', function (req, res)
{
	var comment_promise_0 = GetComments(0, COMMENT_LIMIT, req.body.id, -1, req.cookies.username, req.body.offset)
	comment_promise_0.then(function(response_0) {
	  var comment_promise_1 = GetComments(1, COMMENT_LIMIT, req.body.id, response_0['comment_ids'], req.cookies.username, 0)
	  comment_promise_1.then(function(response_1) {
		  var comment_promise_2 = GetComments(2, COMMENT_LIMIT, req.body.id, response_1['comment_ids'], req.cookies.username, 0)
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
		      res.send( 
			  {
				  comments: all_comments,
				  comment_votes:all_comment_votes,
			  });

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

app.post('/load_feed', function (req, res)
{
	SendFeed(req, res, POST_LIMIT);
});

app.post('/post', function (req, res)
{
	var temp_username = "hansen";
	var date = String(new Date().getTime());

	var url = req.body.song;
	
	url = url.substring(url.indexOf("https://") + 0);
	url = url.substring(0, url.indexOf("width") - 2);

	var username = req.cookies.username;
	var post_id = uuidv3(String(temp_username + "/" + req.body.title), uuidv3.URL);

	var spotify_username = '44a9442188734ab2999542562c6477c3';
	var spotify_password = '9c24d61cf7234c4a80f6f2f49ecc9c45';
	if (url == "")
	{
		res.send({})
		return;
	}
	var spotify = new Spotify({
	  id: spotify_username,
	  secret: spotify_password
	});



	spotify
	  .request(url)
	  .then(function(data) {
	  	var album_songs = {};
	  	var all_artists = [];
	  	if (data.indexOf('"track_number":2') != -1 && data.indexOf('"track_number":1') != -1)
		{
			
			var track_number = 1;
			while (data.indexOf('"track_number":' + track_number) != -1)
			{
				var song_narrowed = data.split('"track_number":' + track_number)[1];
				song_narrowed = song_narrowed.split("duration_ms")[1];
				if (song_narrowed == undefined) break;
				var album_song = song_narrowed.substring(song_narrowed.indexOf("name") + 7, song_narrowed.indexOf('preview_url')-3);
				album_songs[track_number] = album_song;
				++track_number;
			}
			var release_date = data.substring(data.indexOf('release_date"') + 15, data.indexOf("release_date_precision") - 3);
			var narrowed = data.split('script id="resource"')[1];
			var artist = ""//narrowed.substring(narrowed.indexOf("name") + 7, narrowed.indexOf('"type"') - 2);
		    while (narrowed.indexOf('"type":"artist"') != -1)
		    {
		    	all_artists.push(narrowed.substring(narrowed.indexOf("name") + 7, narrowed.indexOf("type") - 3))
		    	artist += narrowed.substring(narrowed.indexOf("name") + 7, narrowed.indexOf("type") - 3) + "^" ;
		    	narrowed = narrowed.substring(narrowed.indexOf("uri"));
		    	narrowed = narrowed.substring(narrowed.indexOf("external_urls"));
			}
			narrowed = narrowed.split("label")[1];
			var album = narrowed.substring(narrowed.indexOf("name") + 7, narrowed.indexOf("popularity") - 3);
			var song_name = "NO_SONG_ALBUM_ONLY";
			var type = 1;

			var sql = "INSERT into user_content (id, username, embedded_content, content, timestamp, likes, dislikes, post_id, title, artist, album, song, data) VALUES('" + String(post_id) + "','" 
			    	+ username + "','" + String(req.body.song)+ "','" + String(req.body.content) + "','" + String(date) +"', 0 "+ ", 0,'" + String(post_id) + "',\"" + String(req.body.title) 
			    	+ "\", '" + String(artist) + "', '" + String(album) + "', '" + String(song_name) +  "'," + "'{}'" + ")";
			connection.query(sql, function (err, result, fields) 
			{
			    
			});
		 //    if (all_artists.length > 1)
		 //    {
			//     for (var i = 0; i < all_artists.length; ++i)
			//     {
			// 		sql = "INSERT into user_content (id, username, embedded_content, content, timestamp, likes, dislikes, post_id, title, artist, album, song, data) VALUES('" + String(post_id) + "','" 
			//     	+ username + "','" + String(req.body.song)+ "','" + String(req.body.content) + "','" + String(date) +"', 0 "+ ", 0,'" + String(post_id) + "',\"" + String(req.body.title) 
			//     	+ "\", '" + String(all_artists[i]) + "', '" + String(album) + "', '" + String(song_name) +  "'," + "'{}'" + ", 0, '" + artist + "')";	    	
			// 		console.log(sql)
			// 		connection.query(sql, function (err, result, fields) 
			// 		{

			// 		});
			//     }

			// }
		}
		else
		{
			var release_date = data.substring(data.indexOf('release_date"') + 15, data.indexOf("release_date_precision") - 3);

		    var narrowed = data.split('{"album":{');
		    narrowed = narrowed[1].substring(narrowed[1].indexOf("width"));
		    var album = narrowed.substring(narrowed.indexOf("name") + 7, narrowed.indexOf("release_date") - 3);
		    narrowed = narrowed.split("release_date_precision")
		    narrowed = narrowed[1].substring(narrowed[1].indexOf("external_urls"))
		    var artist = "";
		    
		    while (narrowed.indexOf('"type":"artist"') != -1)
		    {
		    	all_artists.push(narrowed.substring(narrowed.indexOf("name") + 7, narrowed.indexOf("type") - 3))
		    	artist += narrowed.substring(narrowed.indexOf("name") + 7, narrowed.indexOf("type") - 3) + "^" ;
		    	narrowed = narrowed.substring(narrowed.indexOf("uri"));
		    	narrowed = narrowed.substring(narrowed.indexOf("external_urls"));
			}
			artist = artist.substring(0, artist.length - 1);
		    var song_name = narrowed.substring(narrowed.indexOf("name") + 7, narrowed.indexOf("popularity") - 3);
		    var type = 0;
		    

			var sql = "INSERT into user_content (id, username, embedded_content, content, timestamp, likes, dislikes, post_id, title, artist, album, song) VALUES('" + String(post_id) + "','" 
			    	+ username + "','" + String(req.body.song)+ "','" + String(req.body.content) + "','" + String(date) +"', 0 "+ ", 0,'" + String(post_id) + "',\"" + String(req.body.title) 
			    	+ "\", '" + String(artist) + "', '" + String(album) + "', '" + String(song_name) + "')";

			connection.query(sql, function (err, result, fields) 
			{

			});
		    if (all_artists.length > 1)
		    {
			    for (var i = 0; i < all_artists.length; ++i)
			    {

					sql = "INSERT into user_content (id, username, embedded_content, content, timestamp, likes, dislikes, post_id, title, artist, album, song, valid_feed_post, all_artists) VALUES('" + String(post_id) + "','" 
			    	+ username + "','" + String(req.body.song)+ "','" + String(req.body.content) + "','" + String(date) +"', 0 "+ ", 0,'" + String(post_id) + "',\"" + String(req.body.title) 
			    	+ "\", '" + String(all_artists[i]) + "', '" + String(album) + "', '" + String(song_name) + "', 0, '" + artist + "')";			    	
					connection.query(sql, function (err, result, fields) 
					{

					});
			    }
			}
		}
		var sql = "SELECT * from global_posts WHERE song = '" + song_name + "' AND artist = '" + artist + "'";
		connection.query(sql, function (err, result, fields) 
		{
			var already_in_flag = false;
			if (song_name == "NO_SONG_ALBUM_ONLY")
			{
				for (var item of result)
				{
					if (item.song == "NO_SONG_ALBUM_ONLY" && item.album == album)
					{
						already_in_flag = true;
					}
				}
			}
			if (result.length == 0 || (!already_in_flag && song_name == "NO_SONG_ALBUM_ONLY"))
			{
				var new_post_id = uuidv3(artist + "/" + album + "/" + song_name, uuidv3.URL);
				var new_post_timestamp = String(new Date().getTime());
				for (var key of Object.keys(album_songs))
				{
					//temp, need to correctly replace, backslash doesn't work
					album_songs[key] = album_songs[key].replace("'", "~")
					//album_songs[key] = album_songs[key].replace('"', '~')	shouldn't need this right
				}

				var new_global_post_sql = "INSERT into global_posts(post_id, timestamp, likes, embedded_content, content, song, album, type, artist, data, release_date, relevant_timestamp) "+
				"VALUES('" + new_post_id + "', " + new_post_timestamp + ", 0, '" + req.body.song + "', '" + String(req.body.content) + "', '" + 
				song_name + "', '" + album  + "',"+ type + " , '" + artist + "', '" + JSON.stringify(album_songs) + "', '" + release_date + "', " + (new_post_timestamp - 86400000) + ");"
				connection.query(new_global_post_sql, function (err, result, fields) 
				{
				});
				if (all_artists.length > 1)
				{
				    for (var i = 0; i < all_artists.length; ++i)
				    {
						new_global_post_sql = "INSERT into global_posts(post_id, timestamp, likes, embedded_content, content, song, album, type, artist, data, release_date, relevant_timestamp, valid_feed_post, all_artists) "+
						"VALUES('" + new_post_id + "', " + new_post_timestamp + ", 0, '" + req.body.song + "', '" + String(req.body.content) + "', '" + 
						song_name + "', '" + album  + "',"+ type + " , '" + all_artists[i] + "', '" + JSON.stringify(album_songs) + "', '" + release_date + "', " + (new_post_timestamp - 86400000) + ", 0, '" + artist + "');"			    	
						connection.query(new_global_post_sql, function (err, result, fields) 
						{

						});
				    }
				}
			}
		});
		res.send({});
	})
	  .catch(function(err) {
	    console.error('Error occurred: ' + err); 
	});
});

app.post('/', (req, res) => {
	const response = new Response();
	res.send({ hello: 'world' });
})

app.get('/random', (req, res) => {
	var user_content_number_sql = "SELECT COUNT(*) from user_content"
	connection.query(user_content_number_sql, function (err, result, fields){
		var num_user_content = result[0]['COUNT(*)']
		var global_posts_number_sql = "SELECT COUNT(*) from global_posts"
		connection.query(global_posts_number_sql, function (err, result, fields){
			var num_global_posts = result[0]['COUNT(*)']
			if (Math.random() > num_global_posts / (num_global_posts + num_user_content))
			{
				var user_search_sql = "SELECT * FROM user_content ORDER BY RAND() LIMIT 1";
				connection.query(user_search_sql, function (err, result, fields){
					result = result[0]
					if (result.username != undefined)
					{
						req.url = '/user/' + result.username + "/" + result.id;

					} 
					res.redirect(req.url)
				});
			}
			else
			{
				var global_search_sql = "SELECT * FROM global_posts ORDER BY RAND() LIMIT 1";
				connection.query(global_search_sql, function (err, result, fields){
					result = result[0]
					if (result.song == "NO_SONG_ALBUM_ONLY")
					{
						req.url = '/album/' + result.artist + "/" + result.album;
					}
					else
					{
						req.url = '/post/' + result.artist + "/" + result.song;
					}
					res.redirect(req.url)
				});				
			}
		});
	});
})

app.post('/search', (req, res) => {
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

setInterval(function () {
    connection.query('SELECT 1');
}, 5000);


module.exports = app;