import React from 'react';
import utils from './utils.js'

function generateComments(comments, comment_votes, id, starting_comment_level, is_global = false)
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

			var comment_vote;
			for (var vote of comment_votes)
			{
				if (vote.comment_id == comment.comment_id)
				{
					comment_vote = vote;
				}
			}
			current_comments.push(<Comment key = {comment.comment_id} original_replies = {original_replies} data = {comment} child_comments = {comment_map[comment.comment_id]} vote_state = {comment_vote} post_id = {comment.post_id} is_global = {is_global}/>)
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
			var left_offset = String((props.data.comment_level) * 5 - 1) + '%'
			this.replies_button = <button onClick = {this.showReplies.bind(this)} className = 'show_replies' style = {{position:'relative', left:left_offset}} id = {props.data.comment_id} > show {props.data.replies} replies </button>;
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
		this.newCommentTextRef = React.createRef();

		this.up_image = "/small_up.png"
		this.down_image = "/small_down.png"
	}

	addChild(comment)
	{
		this.child_comments.push(<Comment key={comment.data.comment_id} data = {comment.data}/>)
	}

	upvoteClicked()
	{
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
		if (this.props.is_global)
		{
			
			//window.location = "/user/" + this.props.data.user_id + "/" + this.props.data.post_id
		}
		else
		{
			if (!utils.checkLoggedIn())
			{
				alert("MUST BE LOGGED IN")
				return;
			}
			this.new_comment = <div>
					<textarea ref = {this.newCommentTextRef} class = 'comment_text' id = {this.props.data.comment_id} name='content' rows='10' cols='90' style={{width:'100%',height:'50px',zIndex:'100'}}></textarea>
					<br/>
					<button onClick = {this.submitNewComment.bind(this)} style={{position:'relative'}} type='button' class='submit_new_comment' id = {this.props.data.comment_id}>submit</button>
					<button onClick = {this.closeNewComment.bind(this)} style={{position:'relative'}} type='button' class='close_new_comment' id = {this.props.data.comment_id}>close</button>
				</div>
			this.forceUpdate();
		}
	}
	closeNewComment()
	{
		this.new_comment = undefined
		this.forceUpdate();		
	}

	submitNewComment()
	{
	    fetch("/comment", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },

	        body: JSON.stringify({id: this.props.post_id, 
	        					  text: this.newCommentTextRef.current.value, 
	        					  comment_level: this.props.data.comment_level + 1, 
	        					  parent_comment_id: this.props.data.comment_id}),})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	//location.reload(true);
	    })	    
	    this.closeNewComment();
	}

	showReplies()
	{
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

	    	var child_comments = generateComments(data.comments, data.comment_votes, that.props.post_id, that.props.data.comment_level + 1, that.global_post == undefined)[0]
	    	//don't know why this doesn't work
	    	for (var comment of child_comments)
	    	{
	    		that.child_comments.push(comment);
	    	}
	    	//that.new_child_comments = child_comments
	    	that.forceUpdate()
	 	})


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
			left_spaces.push(<div style = {{borderLeft: "3px solid gray",position:'relative', width:'50px'}}></div>)//<span style = {{borderLeft: "3px solid black", width:'50px', height:'100%'}}> </span>);
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
		var comment_text = this.props.data.text;

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
				      	// <button ref = {this.upvoteRef} onClick = {this.upvoteClicked.bind(this)} style={{top:'0px',position:'absolute',height:'30px', color:upvote_color}} type='button' className = 'upvote' id = {comment_id}>^</button>
				      	// <button ref = {this.downvoteRef}  onClick = {this.downvoteClicked.bind(this)} style={{bottom:'0px',position:'absolute',height:'30px', color:downvote_color}} type='button' className = 'downvote' id = {comment_id}>v</button>

		//<button onClick = {this.openNewComment.bind(this)} type='button' className = 'begin_comment' id = {comment_id}>Comment</button> 
		return (
			<div style = {{background:'white', borderRadius:'4px', maxWidth:'1000px'}}>
	      		
		      	<div className= {comment_level} id= {comment_id} replies= {replies} style={{position:'relative', paddingBottom:'10px', display:'flex', flexDirection:'row', flex: '1 1 auto'}}>
			      	{left_spaces}
			      	<div style={{position:'relative', height:'60px', width:'5%'}}>

						<div style = {{top:'0px',height:'30px', zIndex:'10'}}><img onClick = {this.upvoteClicked.bind(this)} src={this.up_image} width="20" height="20" alt=""/></div>
						<div style = {{bottom:'0px',height:'30px', zIndex:'10'}}><img onClick = {this.downvoteClicked.bind(this)} src={this.down_image} width="20" height="20" alt=""/></div>

			      	</div>
			      	<div style={{position:'relative', width:'100%'}}>
			      		<div ref = {this.scoreRef} style={{width:'75%',height:'20px', fontSize:'10pt'}} className='comment_header' id = {comment_id}> 
			      			{user_id + " | " + this.votes_score + " | "+ date_text}
			      			
			      			
			      		</div>
			      		<div style={{width:'75%'}} className ='comment_body' id = {comment_id}> {comment_text} </div> 
			      		<div style={{width:'75%',height:'25px', fontSize:'10pt'}} onClick = {this.openNewComment.bind(this)} className = 'begin_comment' id = {comment_id}> Reply </div>
			      	</div>
		    	</div>
		    	{this.new_comment}
	    		{this.child_comments.map((child) => {return child})}
	    		{this.replies_button}
	    		{this.test_text}
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
		if (props.user_posts != undefined)
		{
			this.global_offset += props.user_posts.length
		}
		this.loading_comments_semaphor = false;

		this.new_comment = undefined;
		this.newCommentTextRef = React.createRef();
		this.user_posts = props.posts;
	}

	makePosts(user_posts, comments)
	{
		if (user_posts != undefined)
		{
			var post_and_comments = [];
			user_posts.map((post) => {
				var current_comment = undefined;
				for (var comment of comments)
				{
					if (comment.props.post_id == post.post_id)
					{
						current_comment = comment;
						break;
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
				var comment = undefined;
				
				if (current_comment != undefined)
				{
					var comment_id = current_comment.props.comment_id;
					var comment = current_comment;						
				}

				post_and_comments.push( 
				<div>
			      	<div style={{position:'relative', left:'0%', top:'20px', background:'white', paddingLeft:'5px', paddingBottom:'5px', borderBottom:'solid black 3px', maxWidth:'1000px'}}>
				      		<div style={{width:'100%',height:'35px', fontSize:'16pt', textAlign:'center', display:'flex', flexDirection:'row'}} className='comment_header' id = {comment_id}> 
				      			<div style = {{margin:'0'}}>
				      				{post.username  + " | " + parseInt(post.likes - post.dislikes)}
				      			</div>
				      			<div style = {{margin:'0 auto'}}>
				      				{post.title}
				      			</div>
				      			<div style = {{marginRight:'0px'}}>
				      				{date_text}
				      			</div>
				      		</div>
				      		<div style={{width:'75%'}} className ='comment_body' id = {comment_id}> {post.content} </div> 
			    	</div>	
			    	<div style={{position:'relative', top:'20px'}}>
						{comment}
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
		var comment_result = generateComments(comments, comment_votes, id, 0, this.global_post != undefined);		
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
		    	var comment_result = generateComments(data.comments, data.comment_votes, that.props.post_id, 0, that.global_post == undefined)
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
						        	offset:that.offset, 
						        	song: that.props.global_post.song, 
						        	artist:that.props.global_post.artist, 
						        	album:that.props.global_post.album})})
		    .then(function(response) { return response.json();})
		    .then(function (data) { 
		    	that.global_offset += data.user_posts.length;
		    	var comment_result = generateComments(data.comments, data.comment_votes, that.props.post_id, 0, that.global_post == undefined)
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
				<textarea ref = {this.newCommentTextRef} class = 'comment_text' id = {this.props.comment_id} name='content' rows='10' cols='90' style={{width:'80%',height:'50px',zIndex:'100'}}></textarea>
				<br/>
				<button onClick = {this.submitNewComment.bind(this)} style={{position:'relative'}} type='button' class='submit_new_comment' id = {this.props.comment_id}>submit</button>
				<button onClick = {this.closeNewComment.bind(this)} style={{position:'relative'}} type='button' class='close_new_comment' id = {this.props.comment_id}>close</button>
			</div>
		this.forceUpdate();
	}

	closeNewComment()
	{
		this.new_comment = undefined
		this.forceUpdate();		
	}

	submitNewComment()
	{
	    fetch("/comment", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },

	        body: JSON.stringify({id: this.props.post_id, 
	        					  text: this.newCommentTextRef.current.value, 
	        					  comment_level: 0, 
	        					  parent_comment_id: -1,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) { 
	    	location.reload(true);
	    })
	    this.closeNewComment();
	}

	render()
	{

		return (
			<div style = {{position:'relative', left: '5%', paddingTop:'100px'}}>
				<button onClick = {this.openNewComment.bind(this)} type='button' className = 'begin_comment'>Comment</button> 
				{this.new_comment}
				<br/>
				<br/>
				{this.comments.map((comment) => {return comment})}
			</div>
		);
	}
}