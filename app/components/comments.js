import React from 'react';
import utils from './utils.js'
import tag_utils from './tag_utils.js'

function generateComments(comments, comment_votes, id, starting_comment_level, post_data, mixpanel)
{
	var levels = [];
	var level_zero_comments = 0;
	for (var comment of comments)
	{
		if(comment.comment_level == 0)
		{
			++level_zero_comments;
		}
		if (comment.comment_level+1 > levels.length)
		{
			var current_levels_length = levels.length;
			for (var i = 0;i < comment.comment_level + 1 -current_levels_length;i++)
			{
				levels.push([]);
			}
			levels[comment.comment_level].push(comment);
		}
		else
		{
			levels[comment.comment_level].push(comment);
		}
	}
	var comment_map = {};
	var current_comments = [];
	for (var level = levels.length - 1; level >= 0; level--)
	{
		for (var comment of levels[level])
		{
			var original_replies = comment.replies
			if (comment_map[comment.comment_id] != undefined)
			{
				for (var child of comment_map[comment.comment_id])
				{
					comment.replies = comment.replies - child.props.original_replies - 1;
				}
			}
			var comment_vote = -1;
			for (var vote of comment_votes)
			{
				if (vote.comment_id == comment.comment_id)
				{
					comment_vote = vote;
				}
			}
			current_comments.push(<Comment key = {comment.comment_id} original_replies = {original_replies} data = {comment} child_comments = {comment_map[comment.comment_id]} vote_state = {comment_vote} post_id = {comment.post_id} post_data = {post_data} mixpanel = {mixpanel}/>)
			//current_comments.push(<div>PLEASE</div>)
		}
		if (level == starting_comment_level)
		{
			break;
		}
		//comment here is different from above, its a Comment component rather than data

		for (var comment of current_comments)
		{
			var parent_id = comment.props.data.parent_comment_id;
			if (comment_map[parent_id] == undefined)
			{
				comment_map[parent_id] = [comment];
			}
			else
			{
				comment_map[parent_id].push(comment);
			}
		}
		current_comments = [];
	}	

	return [current_comments, level_zero_comments];

}

// class NewComment extends React.Component
// {
// 	constructor(props)
// 	{
// 		super(props)
// 		this.newCommentTextRef = React.createRef();
// 	}

// 	closeNewComment()
// 	{
// 		console.log("CLOSE COMMENT")
// 		this.new_comment = undefined
// 		this.forceUpdate();		
// 	}

// 	submitNewComment()
// 	{
// 	    fetch("/comment", {
// 	        method: "POST",
// 	        headers: {
// 	        	Accept: 'application/json',
// 	        	'Authorization': 'Basic',
// 	        	'Content-Type': 'application/json',
// 	        },

// 	        body: JSON.stringify({id: this.props.post_id, 
// 	        					  text: this.newCommentTextRef.current.value, 
// 	        					  comment_level: this.props.comment_level + 1, 
// 	        					  parent_comment_id: this.props.comment_id}),})
// 	    this.closeNewComment();
// 	}

// 	render()
// 	{
// 		return (
// 			<div>
// 				<textarea ref = {this.newCommentTextRef} class = 'comment_text' id = {this.props.comment_id} name='content' rows='10' cols='90' style={{width:'80%',height:'50px',zIndex:'100'}}></textarea>
// 				<button onClick = {this.submitNewComment.bind(this)} style={{height:'30px',bottom:'30px',position:'relative'}} type='button' class='submit_new_comment' id = {this.props.comment_id}>submit</button>
// 				<button onClick = {this.closeNewComment.bind(this)} style={{bottom:'0px',position:'relative',height:'30px'}} type='button' class='close_new_comment' id = {this.props.comment_id}>x</button>
// 			</div>
// 		)
// 	}

// }

class Comment extends React.Component
{
	constructor(props)
	{
		super(props);
		//this.child_comments = [<Comment data = {props.data} child_comments = {undefined} vote_state = {undefined} post_id = {props.post_id}/>];
		this.id = this.props.data.comment_id;
		this.replies_button = undefined;
		this.child_comments = []

		if (props.child_comments != undefined)
		{
			for (var comment of props.child_comments)
			{
				this.child_comments.push(comment)
				//this.child_comments.push(<div>HEY</div>)
			}
		}
		if (props.data.replies > 0)
		{
			//, color:'white', borderRadius:'7px', backgroundColor:'#188275', border:'0'
			var left_offset = String((props.data.comment_level) * 5 - 1) + '%'
			this.replies_button = <button onClick = {this.showReplies.bind(this)} className = 'show_replies' style = {{position:'relative', left:left_offset, fontSize:'12px'}} id = {props.data.comment_id} > show {props.data.replies} replies </button>;
      	}
      	this.upvoteRef = React.createRef();
      	this.downvoteRef = React.createRef();
      	this.scoreRef = React.createRef();
		
		this.votes_score = this.props.data.upvotes - this.props.data.downvotes;

		this.vote_state = -1;
		if (this.props.vote_state != undefined)
		{
			this.vote_state = this.props.vote_state.vote_state
		}
		this.new_comment = undefined;
		this.contentRef = React.createRef();

		this.up_image = "/small_up.png"
		this.down_image = "/small_down.png"

		this.tagFlag = false
		this.currentTag = ""
		this.tagList = []
		this.artists = []
		this.users = []
		this.artistSearch = false
		this.currentArtist = ""
		this.potential_tags = []
		this.songs_and_albums = []
		this.artistFlag = false
		this.lastContentSize = 0
		this.tagged = false
	}

	addChild(comment)
	{
		this.child_comments.push(<Comment key={comment.data.comment_id} data = {comment.data} post_data = {this.props.post_data} mixpanel = {this.props.mixpanel}/>)
	}

	upvoteClicked()
	{
		this.props.mixpanel.track("Upvote Clicked", {"Vote State":this.vote_state})
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}

    	if (this.vote_state == 1)
    	{
    		// this.upvoteRef.current.style.color = 'black'
    		// this.downvoteRef.current.style.color = 'black'
    		this.up_image = "/small_up.png"
    		this.vote_state = -1
    		this.votes_score = this.votes_score - 1;
    	}
    	else
    	{
    		// this.upvoteRef.current.style.color = 'blue'
    		// this.downvoteRef.current.style.color = 'black'
    		
       		if (this.vote_state == 0)
    		{
    			this.votes_score = this.votes_score + 2;
    		}
    		else
    		{
    			this.votes_score = this.votes_score + 1;
    		}
    		this.up_image = "/small_up_on.png"
    		this.down_image = "/small_down.png"
    		this.vote_state = 1;
    	}

    	this.forceUpdate();
    	

	    fetch("/upvote", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id: this.props.data.comment_id,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	 	})	
	}

	downvoteClicked()
	{
		this.props.mixpanel.track("Downvote Clicked", {"Vote State":this.vote_state})
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}

		if (this.vote_state == 0)
    	{
    		// this.upvoteRef.current.style.color = 'black'
    		// this.downvoteRef.current.style.color = 'black'
			this.down_image = "/small_down.png"
    		this.vote_state = -1
    		this.votes_score = this.votes_score + 1;
    	}		
    	else if (this.vote_state == 1 || this.vote_state == -1)
    	{
    		// this.upvoteRef.current.style.color = 'black'
    		// this.downvoteRef.current.style.color = 'red'
    		
    		if (this.vote_state == 1)
    		{
    			this.votes_score = this.votes_score - 2;
    		}
    		else
    		{
    			this.votes_score = this.votes_score - 1;
    		}
       		this.down_image = "/small_down_on.png"
    		this.up_image = "/small_up.png"
    		this.vote_state = 0;
    	}
    	

    	this.forceUpdate();

	    fetch("/downvote", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id: this.props.data.comment_id,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	 	})	
	}

	openNewComment()
	{
		this.props.mixpanel.track("New Comment Started", {"Comment ID": this.props.data.comment_id})
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		this.new_comment = <div>
				<textarea onChange = {this.contentInput.bind(this)} ref = {this.contentRef} className = 'comment_text' id = {this.props.data.comment_id} name='content' rows='10' cols='90' style={{width:'100%',height:'50px',borderRadius:'7px'}}></textarea>
				<br/>
				<button onClick = {this.submitNewComment.bind(this)} style={{position:'relative', width:'50%', height:'28px'}} type='button' className='submit_new_comment grayButton' id = {this.props.data.comment_id}>submit</button>
				<button onClick = {this.closeNewComment.bind(this)} style={{position:'relative', width:'50%', height:'28px'}} type='button' className='close_new_comment grayButton' id = {this.props.data.comment_id}>close</button>
			</div>
		this.forceUpdate();
	}
	closeNewComment()
	{
		this.props.mixpanel.track("Close New Comment", {"Comment ID": this.props.data.comment_id})
		this.new_comment = undefined
		this.tagFlag = false
		this.forceUpdate();		
	}

	submitNewComment()
	{
		this.props.mixpanel.track("Submit New Comment", {"Comment ID": this.props.data.comment_id})
		var submit_text = this.contentRef.current.value;
		var that = this
	    fetch("/comment", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },

	        body: JSON.stringify({id: this.props.post_id, 
	        					  text: this.contentRef.current.value, 
	        					  comment_level: this.props.data.comment_level + 1, 
	        					  parent_comment_id: this.props.data.comment_id,
	        					  post_username: this.props.post_data.username,
	        					  post_id: this.props.post_data.post_id,
	        					  post_title:this.props.post_data.title,
	        					  potentialTags: this.potential_tags,
	    						  username: this.props.data.user_id})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
		    var new_comment_data = {
		    	post_id: data.comment_id,
		    	user_id: data.username,
		    	text: submit_text, 
		    	timestamp: parseInt(data.timestamp),
		    	upvotes: 0,
		    	downvotes: 0,
		    	replies: 0,
		    	comment_id: data.comment_id,
		    	parent_comment_id: that.props.data.comment_id,
		    	comment_level: that.props.data.comment_level + 1,
		    }
		    that.child_comments.splice(0, 0,<Comment key = {data.comment_id} original_replies = {0} data = {new_comment_data} child_comments = {[]} vote_state = {-1} post_id = {data.comment_id} post_data = {that.props.post_data} mixpanel ={that.props.mixpanel}/>)
		    that.forceUpdate()
	    })	    
	    this.tagFlag = false
	    this.closeNewComment();

	}

	showReplies()
	{
		this.props.mixpanel.track("Show Replies", {"Comment ID": this.props.data.comment_id})
		var that= this;
		this.replies_button = undefined;
		this.forceUpdate()
	    fetch("/show_replies", {
	        method: "POST",
	        headers: {
	        	'Accept': 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id: this.props.data.comment_id, offset: this.child_comments.length})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	

	    	var child_comments = generateComments(data.comments, data.comment_votes, that.props.post_id, that.props.data.comment_level + 1, that.props.post_data, that.props.mixpanel)[0]
	    	//don't know why this doesn't work
	    	for (var comment of child_comments)
	    	{
	    		that.child_comments.push(comment);
	    	}
	    	//that.new_child_comments = child_comments
	    	that.forceUpdate()
	 	})
    }

	contentInput()
	{
		var input = event.target.value;
		//update and prune tags list 
		tag_utils.getTags(this)

    	this.lastContentSize = this.contentRef.current.value.length
	   	this.forceUpdate();
	}

	selectTag(e)
	{
		tag_utils.tagClicked(this, e)
	}

    addCommentChild(comment)
    {
    	this.child_comments.push(comment);
    	this.forceUpdate()
    }
	render()
	{
		var comment_level = "comment_level_" + String(this.props.data.comment_level);
		var comment_id = String(this.props.data.comment_id);
		var replies = 0;
		var left_offset = String(this.props.data.comment_level * 50) + 'px'

		var left_spaces = []
		for (var i = 0; i < this.props.data.comment_level; ++i)
		{
			var left_space = '3px'

			left_spaces.push(<div style = {{borderLeft: "3px solid #C5C5C5",position:'relative', width:'44px', left:left_space}}></div>)//<span style = {{borderLeft: "3px solid black", width:'50px', height:'100%'}}> </span>);
		}
		//var left_spacing = <div style = {{borderLeft: "3px solid black",position:'relative', width:left_offset}}> {left_spaces} </div>;

		var user_id = this.props.data.user_id;

		var date = new Date(this.props.data.timestamp);
		var minutes = date.getMinutes();

		if (String(minutes).length == 1)
		{
			minutes = "0" + String(minutes);
		}
		var date_text = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + " at " + date.getHours() + ":" + minutes;
                 
		// var tags = JSON.parse(this.props.data.tags)
		// var tag_indices = []

		// if (this.props.data.tags != null)
		// {
		// 	tag_indices = Object.keys(tags)
		// 	var remaining_indices = []
		// 	for (var index of tag_indices)
		// 	{
		// 		if (tags[index].length < 5)
		// 		{
		// 			continue
		// 		}
		// 		remaining_indices.push(index)
		// 	}
		// 	tag_indices = remaining_indices
		// 	tag_indices.sort(
		// 			function(a, b){
		// 		    	if (parseInt(a) > parseInt(b))
		// 		        {
		// 		        	return 1;
		// 		        }
		// 		        return -1;
		// 			})
				    		
		// } 
		// var total_index = 0;
		// var comment_div = []
		// this.props.data.text.split('\n').map((item, i) => {
		// 	var current_text = ""
		// 	var tag_index = 0;
		// 	var all_content = []
		// 	var index = 0;
		// 	while (tag_indices[0] < total_index + item.length)
		// 	{
		// 		var before_text = item.substring(index, tag_indices[0] - total_index)
		// 		var current_index = tag_indices[0] - total_index;
		// 		var tag = ""
		// 		while (current_index < item.length)
		// 		{
		// 			if (item[current_index] == ' ' || 
		// 				item[current_index] == '\t' ||
		// 				item[current_index] == '\n')
		// 			{
		// 				break
		// 			}

		// 			tag += item[current_index]
		// 			++current_index
		// 		}
		// 		current_text = ""
		// 		index = current_index
		// 		all_content.push(before_text)
		// 		all_content.push(<a href = {tags[tag_indices[0]][4]}>{tag}</a>)
		// 		tag_indices.splice(0,1);
		// 	}
		// 	total_index += item.length 
		// 	all_content.push(item.substring(index, item.length))
		// 	comment_div.push(<p style = {{minHeight:'26.67px'}} key={i}>{all_content}</p>);
		// })
		var comment_div = []
		comment_div = tag_utils.formatContent(this.props.data.text, this.props.data.tags)

		var upvote_color = 'black'
		var downvote_color = 'black'

		if (this.vote_state == 1)
		{
			upvote_color = 'blue'
			this.up_image = "/small_up_on.png"
		}
		else if (this.vote_state == 0)
		{
			downvote_color = 'red'
			this.down_image = "/small_down_on.png"
		}


		var tag_display = 'none'
		if (this.tagFlag)
		{
			tag_display = ''
		}
				      	// <button ref = {this.upvoteRef} onClick = {this.upvoteClicked.bind(this)} style={{top:'0px',position:'absolute',height:'30px', color:upvote_color}} type='button' className = 'upvote' id = {comment_id}>^</button>
				      	// <button ref = {this.downvoteRef}  onClick = {this.downvoteClicked.bind(this)} style={{bottom:'0px',position:'absolute',height:'30px', color:downvote_color}} type='button' className = 'downvote' id = {comment_id}>v</button>
						// <div style = {{top:'0px',height:'30px', zIndex:'10'}}><img onClick = {this.upvoteClicked.bind(this)} src={this.up_image} width="20" height="20" alt=""/></div>
						// <div style = {{bottom:'0px',height:'30px', zIndex:'10'}}><img onClick = {this.downvoteClicked.bind(this)} src={this.down_image} width="20" height="20" alt=""/></div>
						// <div style = {{position:'relative', minHeight: '14.66px', width:'6px', borderRight:'3px solid #C5C5C5', top:'20px'}}>
						// </div>
		//<button onClick = {this.openNewComment.bind(this)} type='button' className = 'begin_comment' id = {comment_id}>Comment</button> 
		return (
			<div style = {{background:'white', borderRadius:'4px', maxWidth:'1000px'}}>
	      		
		      	<div className= {comment_level} id= {comment_id} replies= {replies} style={{position:'relative', display:'flex', flexDirection:'row'}}>
			      	{left_spaces}
			      	<div style={{position:'relative', minHeight:'62.66px', width:'30px', display:'flex', flexDirection:'column', top:'5px'}}>

						<svg onClick = {this.upvoteClicked.bind(this)} width="10" height="16" viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg" color = 'blue'>
							<path d="M8.70711 0.987356C8.31658 0.596832 7.68342 0.596832 7.29289 0.987356L0.928931 7.35132C0.538407 7.74184 0.538407 8.37501 0.928931 8.76553C1.31946 9.15606 1.95262 9.15606 2.34315 8.76553L8 3.10868L13.6569 8.76553C14.0474 9.15606 14.6805 9.15606 15.0711 8.76553C15.4616 8.37501 15.4616 7.74184 15.0711 7.35132L8.70711 0.987356ZM9 26.3126L9 1.69446L7 1.69446L7 26.3126L9 26.3126Z" fill={upvote_color}/>
						</svg>

						<svg style = {{position:'relative', top:'10px'}} onClick = {this.downvoteClicked.bind(this)} width="10" height="16" viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.29289 26.0197C7.68342 26.4102 8.31658 26.4102 8.70711 26.0197L15.0711 19.6557C15.4616 19.2652 15.4616 18.632 15.0711 18.2415C14.6805 17.851 14.0474 17.851 13.6569 18.2415L8 23.8984L2.34315 18.2415C1.95262 17.851 1.31946 17.851 0.928932 18.2415C0.538408 18.632 0.538408 19.2652 0.928932 19.6557L7.29289 26.0197ZM7 0.694489L7 25.3126H9L9 0.694489L7 0.694489Z" fill={downvote_color}/>
						</svg>

			      	</div>
			      	<div style={{position:'relative', maxWidth:'970px', minWidth:'300px'}}>
			      		<div ref = {this.scoreRef} style={{display:'flex', flexDirection:'row', width:'95%',height:'20px', fontSize:'10pt', color: '#5b5b5b'}} className='comment_header' id = {comment_id}> 
			      			<div style = {{color:'#188275'}}> 
			      				<a style = {{color:'#188275', fontWeight:'bold'}} href = {"/user/" + this.props.data.user_id}> {this.props.data.user_id} </a>
			      			</div>
			      			<div style = {{height:'15px', width:'10px'}}>
			      			</div>
			      			<div>
			      				{this.votes_score + " points"}
			      			</div>
			      			<div style = {{height:'15px', width:'10px'}}>
			      			</div>
			      			<div>
			      				{date_text}
			      			</div>
			      			
			      		</div>
			      		<div style={{width:'95%'}} className ='comment_body' id = {comment_id}> {comment_div} </div> 
			      		<div style={{width:'95%',height:'25px', fontSize:'10pt', color: '#188275'}} onClick = {this.openNewComment.bind(this)} className = 'begin_comment' id = {comment_id}> Reply </div>
			      	</div>
		    	</div>
		    	{this.new_comment}
	    		{this.child_comments.map((child) => {return child})}
	    		{this.replies_button}
	    		{this.test_text}
				<div style = {{position:'fixed', width: '200px', height:'300px', right:'10%', top:'200px', backgroundColor:'white', display:tag_display, zIndex:15, overflow:'scroll'}} >
					{this.tagList}
				</div>
	    	</div>
		);
	}
}
export default class CommentSection extends React.Component 
{
	constructor(props)
	{
		super(0);
		this.comments = [];
		this.offset = 0;
		this.global_offset = 0;
		this.loading_comments_semaphor = false;

		this.new_comment = undefined;
		this.contentRef = React.createRef();
		this.user_posts = props.posts;

		this.tagFlag = false
		this.currentTag = ""
		this.tagList = []
		this.artists = []
		this.users = []
		this.artistSearch = false
		this.currentArtist = ""
		this.songs_and_albums = []
		this.artistFlag = false
		this.lastContentSize = 0
		this.tagged = false
		this.potential_tags = []
	}

	makePosts(user_posts, comments)
	{
		if (user_posts != undefined)
		{
			this.global_offset += user_posts.length;
			var post_and_comments = [];
			user_posts.map((post) => {
				var current_comments = [];
				for (var comment of comments)
				{
					if (comment.props.post_id == post.post_id)
					{
						current_comments.push(comment);
					}
				}
				var date = new Date(post.timestamp);
				var minutes = date.getMinutes();

				if (String(minutes).length == 1)
				{
					minutes = "0" + String(minutes);
				}
				var date_text = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + " at " + date.getHours() + ":" + minutes;

				var comment_id = -1;
	
				if (current_comments.length != 0)
				{
					var comment_id = current_comments[0].props.comment_id;				
				}

				var content_div = []
				// var total_index = 0;
				// var tags = JSON.parse(this.props.data.tags)
				// var tag_indices = []

				// if (post.tags != null)
				// {
				// 	tag_indices = Object.keys(tags)
				// 	var remaining_indices = []
				// 	for (var index of tag_indices)
				// 	{
				// 		if (tags[index].length < 5)
				// 		{
				// 			continue
				// 		}
				// 		remaining_indices.push(index)
				// 	}
				// 	tag_indices = remaining_indices
				// 	tag_indices.sort(
				// 			function(a, b){
				// 		    	if (parseInt(a) > parseInt(b))
				// 		        {
				// 		        	return 1;
				// 		        }
				// 		        return -1;
				// 			})
						    		
				// } 

				// post.content.split('\n').map((item, i) => {
				// 	var current_text = ""
				// 	var tag_index = 0;
				// 	var all_content = []
				// 	var index = 0;
				// 	while (tag_indices[0] < total_index + item.length)
				// 	{
				// 		var before_text = item.substring(index, tag_indices[0] - total_index)
				// 		var current_index = tag_indices[0] - total_index;
				// 		var tag = ""
				// 		while (current_index < item.length)
				// 		{
				// 			if (item[current_index] == ' ' || 
				// 				item[current_index] == '\t' ||
				// 				item[current_index] == '\n')
				// 			{
				// 				break
				// 			}

				// 			tag += item[current_index]
				// 			++current_index
				// 		}
				// 		current_text = ""
				// 		index = current_index
				// 		all_content.push(before_text)
				// 		all_content.push(<a href = {tags[tag_indices[0]][4]}>{tag}</a>)
				// 		tag_indices.splice(0,1);
				// 	}
				// 	total_index += item.length 
				// 	all_content.push(item.substring(index, item.length))
				// 	content_div.push(<p style = {{minHeight:'26.67px'}} key={i}>{all_content}</p>);
				// })
				content_div = tag_utils.formatContent(this.props.global_post.content, this.props.global_post.tags)
				post_and_comments.push( 
				<div>
			      	<div style={{position:'relative', left:'0%', top:'20px', background:'white', paddingLeft:'5px', paddingBottom:'5px', borderBottom:'solid black 3px', maxWidth:'1000px'}}>
				      		<div style={{width:'100%',height:'35px', fontSize:'18pt', textAlign:'center', display:'flex', flexDirection:'row'}} className='comment_header' id = {comment_id}> 
				      			<div style = {{margin:'0'}}>
				      				{post.username  + " | " + parseInt(post.likes - post.dislikes)}
				      			</div>
				      			<div style = {{margin:'0 auto'}}>
				      				<a href= {"/user/" + post.username + "/" + post.post_id}>{post.title} </a>
				      			</div>
				      			<div style = {{marginRight:'0px'}}>
				      				{date_text}
				      			</div>
				      		</div>
				      		<div style={{width:'95%'}} className ='comment_body' id = {comment_id}> {content_div} </div> 
			    	</div>	
			    	<div style={{position:'relative', top:'20px'}}>
						{current_comments}
					</div>
					<br/>
					<br/>
				</div>
				)})
			return post_and_comments;
			
		}
	}

	getComments(comments, comment_votes, id)
	{
		var comment_result = generateComments(comments, comment_votes, id, 0, this.props.post_data, this.props.mixpanel);		
		this.comments = comment_result[0];
		this.offset += comment_result[1]
	}

	componentDidMount() {
		if (this.props.posts == undefined)
		{
	    	window.addEventListener('scroll', this.handleScroll.bind(this));
	    }
	    else
	    {
	    	window.addEventListener('scroll', this.handleScrollGlobal.bind(this));
	    }
	    this.getComments(this.props.comments, this.props.comment_votes, this.props.post_id)
	    if (this.user_posts != undefined)
	    {
	    	this.comments = this.makePosts(this.user_posts, this.comments);
	    }
	    this.forceUpdate();
	}

	componentWillUnmount() {
	    window.removeEventListener('scroll', this.handleScroll.bind(this));
	}

	handleScroll() {
		var that = this;
		this.user_posts = undefined

	    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_comments_semaphor) {
	      	this.loading_comments_semaphor = true;
		    fetch("/load_comments", {
		        method: "POST",
		        headers: {
		        	'Accept': 'application/json',
		        	'Authorization': 'Basic',
		        	'Content-Type': 'application/json',
		        },
		        body: JSON.stringify({id: that.props.post_id, offset:that.offset})})
		    .then(function(response) { return response.json();})
		    .then(function (data) { 
		    	var comment_result = generateComments(data.comments, data.comment_votes, that.props.post_id, 0, that.props.post_data, that.props.mixpanel)
		    	var child_comments = comment_result[0];
		    	that.offset += comment_result[1]
		    	for (var comment of child_comments)
		    	{
		    		that.comments.push(comment)
		    	}
		    	that.forceUpdate()
		    	that.loading_comments_semaphor = false;	
		 	})
		}
	}

	handleScrollGlobal() {
		var that = this;
		this.user_posts = undefined
	    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_comments_semaphor) {
	      	this.loading_comments_semaphor = true;
		    fetch("/load_global_posts", {
		        method: "POST",
		        headers: {
		        	'Accept': 'application/json',
		        	'Authorization': 'Basic',
		        	'Content-Type': 'application/json',
		        },
		        body: JSON.stringify({id: that.props.global_post.post_id, 
						        	offset:that.global_offset, 
						        	song: that.props.global_post.song, 
						        	artist:that.props.global_post.artist, 
						        	album:that.props.global_post.album})})
		    .then(function(response) { return response.json();})
		    .then(function (data) { 
		    	var comment_result = generateComments(data.comments, data.comment_votes, that.props.post_id, 0, that.props.post_data, this.props.mixpanel)
		    	var child_comments = comment_result[0];
		    	that.offset += comment_result[1]
		    	
				if (data.user_posts == undefined)
				{		    	
		    		for (var comment of child_comments)
		    		{
		    			that.comments.push(comment)
		    		}
		    	}
		    	else
		    	{
		    		var new_comments = []
		    		for (var comment of child_comments)
		    		{
		    			new_comments.push(comment)
		    		}
		    		var posts_and_comments = that.makePosts(data.user_posts, new_comments);
		    		for (var item of posts_and_comments)
		    		{
		    			that.comments.push(item)
		    		}
		    	}
		    	that.forceUpdate()
		    	that.loading_comments_semaphor = false;
		 	})
		}
	}

	openNewComment()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		this.new_comment = <div>
				<textarea onChange = {this.contentInput.bind(this)} ref = {this.contentRef} class = 'comment_text' id = {this.props.comment_id} name='content' rows='10' cols='90' style={{width:'80%',height:'50px',zIndex:'100'}}></textarea>
				<br/>
				<button onClick = {this.submitNewComment.bind(this)} style={{position:'relative'}} type='button' className='submit_new_comment' id = {this.props.comment_id}>submit</button>
				<button onClick = {this.closeNewComment.bind(this)} style={{position:'relative'}} type='button' className='close_new_comment' id = {this.props.comment_id}>close</button>
			</div>
		this.forceUpdate();
	}

	closeNewComment()
	{
		this.new_comment = undefined
		this.tagFlag = false
		this.forceUpdate();		
	}

	submitNewComment()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		this.props.mixpanel.track("Submit New First Comment", {"Comment ID": this.props.post_data.post_id})
		var that = this;
		var submit_text = this.contentRef.current.value
	    fetch("/comment", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },

	        body: JSON.stringify({id: this.props.post_id, 
	        					  text: this.contentRef.current.value, 
	        					  potentialTags: this.potential_tags,
	        					  post_username: this.props.post_data.username,
	        					  post_id: this.props.post_data.post_id,
	        					  post_title:this.props.post_data.title,
	        					  comment_level: 0, 
	        					  parent_comment_id: -1,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) { 
	    	location.reload(true);
		    // var new_comment_data = {
		    // 	post_id: data.comment_id,
		    // 	user_id: data.username,
		    // 	text: submit_text, 
		    // 	timestamp: parseInt(data.timestamp),
		    // 	upvotes: 0,
		    // 	downvotes: 0,
		    // 	replies: 0,
		    // 	comment_id: data.comment_id,
		    // 	parent_comment_id: -1,
		    // 	comment_level: 0,
		    // }
		    // that.comments.splice(0, 0,<Comment key = {data.comment_id} original_replies = {0} data = {new_comment_data} child_comments = {[]} vote_state = {-1} post_id = {data.comment_id} is_global = {that.props.global_post != undefined}/>)
		    // that.forceUpdate()
	    })
	    this.tagFlag = false
	    this.closeNewComment();
	}

	contentInput()
	{
		var input = event.target.value;
		//update and prune tags list 
		tag_utils.getTags(this)

    	this.lastContentSize = this.contentRef.current.value.length
	   	this.forceUpdate();
	}

	selectTag(e)
	{
		tag_utils.tagClicked(this, e)
	}


	render()
	{

		var tag_display = 'none'
		if (this.tagFlag)
		{
			tag_display = ''
		}
		var new_comment_button = ""//<button onClick = {this.openNewComment.bind(this)} type='button' className = 'begin_comment'>Comment</button>
		if (this.props.global_post != undefined)
		{
			new_comment_button = undefined
		}

		var profile_picture = "#188275"

		return (
			<div style = {{position:'relative', left: '10px', maxWidth:'1000px'}}>
				<div style = {{width:'1000px', display:'flex', flexDirection:'row'}}>
					<div style = {{borderRadius: '50%', backgroundColor:profile_picture, position:'relative', left:'10px', width:'40px', height:'40px'}}>
					</div>
					<textarea ref = {this.contentRef} style = {{position:'relative', height:'40px', left: '40px', width:'820px', borderRadius:'7px', border:'1px solid black'}} placeholder = "  Comment Here.."></textarea>
					<button onClick = {this.submitNewComment.bind(this)} style={{position:'relative', width:'92px', left:'40px'}} type='button' className='submit_new_comment grayButton' id = {this.props.comment_id}>submit</button>
				</div>
				{new_comment_button}
				{this.new_comment}
				<br/>
				{this.comments.map((comment) => {return comment})}
				<div style = {{position:'fixed', width: '200px', height:'300px', right:'10%', top:'200px', backgroundColor:'white', display:tag_display, zIndex:15, overflow:'scroll'}} >
					{this.tagList}
				</div>
			</div>
		);
	}
}