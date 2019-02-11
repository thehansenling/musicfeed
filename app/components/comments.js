import React from 'react';
import utils from './utils.js'

function generateComments(comments, comment_votes, id, starting_comment_level)
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
			if (comment_map[comment.comment_id] != undefined)
			{
				for (var child of comment_map[comment.comment_id])
				{
					comment.replies = comment.replies - child.props.data.replies - 1;
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
			current_comments.push(<Comment key = {comment.comment_id} data = {comment} child_comments = {comment_map[comment.comment_id]} vote_state = {comment_vote} post_id = {id}/>)
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
			var left_offset = String((props.data.comment_level + 1) * 5) + '%'
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
    	if (this.vote_state == 0 || this.vote_state == -1)
    	{
    		this.upvoteRef.current.style.color = 'blue'
    		this.downvoteRef.current.style.color = 'black'
    		
       		if (this.vote_state == 0)
    		{
    			this.votes_score = this.votes_score + 2;
    		}
    		else
    		{
    			this.votes_score = this.votes_score + 1;
    		}
    		this.vote_state = 1;
    	}
    	else if (this.vote_state == 1)
    	{
    		this.upvoteRef.current.style.color = 'black'
    		this.downvoteRef.current.style.color = 'black'
    		this.vote_state = -1
    		this.votes_score = this.votes_score - 1;
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
	    	location.reload(true);
	 	})	
	}

	downvoteClicked()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
    	if (this.vote_state == 1 || this.vote_state == -1)
    	{
    		this.upvoteRef.current.style.color = 'black'
    		this.downvoteRef.current.style.color = 'red'
    		
    		if (this.vote_state == 1)
    		{
    			this.votes_score = this.votes_score - 2;
    		}
    		else
    		{
    			this.votes_score = this.votes_score - 1;
    		}
    		this.vote_state = 0;
    	}
    	else if (this.vote_state == 0)
    	{
    		this.upvoteRef.current.style.color = 'black'
    		this.downvoteRef.current.style.color = 'black'
    		this.vote_state = -1
    		this.votes_score = this.votes_score + 1;
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
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		this.new_comment = <div>
				<textarea ref = {this.newCommentTextRef} class = 'comment_text' id = {this.props.data.comment_id} name='content' rows='10' cols='90' style={{width:'80%',height:'50px',zIndex:'100'}}></textarea>
				<button onClick = {this.submitNewComment.bind(this)} style={{height:'30px',bottom:'30px',position:'relative'}} type='button' class='submit_new_comment' id = {this.props.data.comment_id}>submit</button>
				<button onClick = {this.closeNewComment.bind(this)} style={{bottom:'0px',position:'relative',height:'30px'}} type='button' class='close_new_comment' id = {this.props.data.comment_id}>x</button>
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

	    	var child_comments = generateComments(data.comments, data.comment_votes, that.props.post_id, that.props.data.comment_level + 1)[0]
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
		var left_offset = String(this.props.data.comment_level * 5) + '%'
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
		}
		else if (this.vote_state == 0)
		{
			downvote_color = 'red'
		}

		return (
	      	<div>
		      	<div className= {comment_level} id= {comment_id} replies= {replies} style={{position:'relative', left:left_offset}}>
			      	<div style={{position:'relative', float:'left', height:'60px', width:'5%'}}>
				      	<button ref = {this.upvoteRef} onClick = {this.upvoteClicked.bind(this)} style={{top:'0px',position:'absolute',height:'30px', color:upvote_color}} type='button' className = 'upvote' id = {comment_id}>^</button>
				      	<button ref = {this.downvoteRef}  onClick = {this.downvoteClicked.bind(this)} style={{bottom:'0px',position:'absolute',height:'30px', color:downvote_color}} type='button' className = 'downvote' id = {comment_id}>v</button>
			      	</div>
			      	<div style={{left:'5%',position:'relative'}}>
			      		<div ref = {this.scoreRef} style={{borderStyle:'solid', borderBottomStyle: 'none',width:'75%',height:'35px'}} className='comment_header' id = {comment_id}> 
			      			{user_id + " "+ date_text +" "+ this.votes_score}
			      			<button onClick = {this.openNewComment.bind(this)} type='button' className = 'begin_comment' id = {comment_id}>Comment</button> 
			      		</div>
			      		<div style={{borderStyle:'solid', borderTopStyle: 'none', width:'75%'}} className ='comment_body' id = {comment_id}> {comment_text} </div> 
			      	</div>
		    	</div>
	    		{this.child_comments.map((child) => {return child})}
	    		{this.replies_button}
	    		{this.new_comment}
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

		this.loading_comments_semaphor = false;

		this.new_comment = undefined;
		this.newCommentTextRef = React.createRef();
	}

	getComments(comments, comment_votes, id)
	{
		var comment_result = generateComments(comments, comment_votes, id, 0);		
		this.comments = comment_result[0];
		this.offset += comment_result[1]
	}

	componentDidMount() {
	    window.addEventListener('scroll', this.handleScroll.bind(this));
	    this.getComments(this.props.comments, this.props.comment_votes, this.props.post_id)
	    this.forceUpdate();
	}

	componentWillUnmount() {
	    window.removeEventListener('scroll', this.handleScroll.bind(this));
	}

	handleScroll() {
		var that = this;
	    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_comments_semaphor) {
	      	this.loading_comments_semaphor = true;
		    fetch("/load_comments", {
		        method: "POST",
		        headers: {
		        	'Accept': 'application/json',
		        	'Authorization': 'Basic',
		        	'Content-Type': 'application/json',
		        },
		        body: JSON.stringify({id: that.props.post_id, offset:this.offset})})
		    .then(function(response) { return response.json();})
		    .then(function (data) { 
		    	var comment_result = generateComments(data.comments, data.comment_votes, that.props.post_id, 0)
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

	openNewComment()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		this.new_comment = <div>
				<textarea ref = {this.newCommentTextRef} class = 'comment_text' id = {this.props.comment_id} name='content' rows='10' cols='90' style={{width:'80%',height:'50px',zIndex:'100'}}></textarea>
				<button onClick = {this.submitNewComment.bind(this)} style={{height:'30px',bottom:'30px',position:'relative'}} type='button' class='submit_new_comment' id = {this.props.comment_id}>submit</button>
				<button onClick = {this.closeNewComment.bind(this)} style={{bottom:'0px',position:'relative',height:'30px'}} type='button' class='close_new_comment' id = {this.props.comment_id}>x</button>
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
			<div>
				<button onClick = {this.openNewComment.bind(this)} type='button' className = 'begin_comment'>Comment</button> 
				{this.new_comment}
				{this.comments.map((comment) => {return comment})}
			</div>
		);
	}
}