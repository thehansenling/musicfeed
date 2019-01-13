import React from 'react';

class Comment extends React.Component
{
	constructor(props)
	{
		super(props);
		this.child_comments = [];
		console.log("PROPS")
		console.log(props);
		this.id = this.props.data.comment_id;
		this.replies_button = undefined;
		if (props.data.replies > 0)
		{
			var left_offset = String((props.data.comment_level + 1) * 5) + '%'
			this.replies_button = <button className = 'show_replies' style = {{position:'relative', left:left_offset}} id = {props.data.comment_id} > show {props.data.replies} replies </button>;
      	}
		
	}

	addChild(comment)
	{
		this.child_comments.push(<Comment key={comment.data.comment_id} data = {comment.data}/>)
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
		var score = this.props.data.upvotes - this.props.data.downvotes;
		if (String(minutes).length == 1)
		{
			minutes = "0" + String(minutes);
		}
		var date_text = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + " at " + date.getHours() + ":" + minutes;
		var comment_text = this.props.data.text;
		return (
	      	<div>
		      	<div className= {comment_level} id= {comment_id} replies= {replies} style={{position:'relative', left:left_offset}}>
			      	<div style={{position:'relative', float:'left', height:'60px', width:'5%'}}>
				      	<button style={{top:'0px',position:'absolute',height:'30px'}} type='button' className = 'upvote' id = {comment_id}>^</button>
				      	<button style={{bottom:'0px',position:'absolute',height:'30px'}} type='button' className = 'downvote' id = {comment_id}>v</button>
			      	</div>
			      	<div style={{left:'5%',position:'relative'}}>
			      		<div style={{borderStyle:'solid', borderBottomStyle: 'none',width:'75%',height:'35px'}} className='comment_header' id = {comment_id}> 
			      			{user_id + " "+ date_text +" "+ score}
			      			<button type='button' className = 'begin_comment' id = {comment_id}>Comment</button> 
			      		</div>
			      		<div style={{borderStyle:'solid', borderTopStyle: 'none', width:'75%'}} className ='comment_body' id = {comment_id}> {comment_text} </div> 
			      	</div>
		    	</div>
	    		{this.props.child_comments}
	    		{this.replies_button}
	    	</div>
		);
	}
}

class TestComment extends React.Component 
{
	constructor(props)
	{
		super(props);
	}

	render ()
	{
		return (
			<div>
				<div className = "WHATTHEWHAT">
					TESTING
				</div>
			</div>
		);
	}

}

export default class CommentSection extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.comments = [];
	}

	generateComments(comments)
	{
		var levels = [];
		for (var comment of comments)
		{

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
				console.log("COMMENT REPLIES")
				console.log(comment.replies)
				if (comment_map[comment.comment_id] != undefined)
				{
					for (var child of comment_map[comment.comment_id])
					{
						comment.replies = comment.replies - child.props.data.replies - 1;
					}
				}
				
				console.log(comment.text)
				console.log(comment.replies)

				current_comments.push(<Comment data = {comment} child_comments = {comment_map[comment.comment_id]}/>)
			}
			if (level == 0)
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

		this.comments = current_comments;

	}

	render()
	{

		this.generateComments(this.props.data.comments)
		return (
			<div>
				{this.comments}
			</div>
		);
	}
}