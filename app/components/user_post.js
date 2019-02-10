import React from 'react';
import StandardHeader from './standard_header.js'
import CommentSection from './comments.js'

class UserPostContent extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.likes_score = this.props.data.likes - props.data.dislikes;
		this.likeRef = React.createRef();
		this.dislikeRef = React.createRef();
		this.like_state = -1
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}
	likeClicked()
	{
		var that = this;

	    fetch("/like", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({user: that.props.data.username, id: this.props.data.id,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	// that.likes_score = data.likes_score;
	    	// that.like_state = data.like_state;
	    	// if (that.like_state == 1)
	    	// {
	    	// 	that.likeRef.current.style.color = 'blue'
	    	// 	that.dislikeRef.current.style.color = 'black'
	    	// }
	    	// else if (that.like_state == 0)
	    	// {
	    	// 	that.likeRef.current.style = 'black'
	    	// 	that.dislikeRef.current.style.color = 'red'
	    	// }
	    	// else
	    	// {
	    	// 	that.likeRef.current.style = 'black'
	    	// 	that.dislikeRef.current.style.color = 'black'	    		
	    	// }
	    	// that.forceUpdate();
	 	})	

    	if (this.props.like_state == 1)
    	{
       		this.likes_score -= 1;
    		this.likeRef.current.style = 'black'
    		this.dislikeRef.current.style.color = 'black'
    		this.props.like_state = -1;
    	}
    	else
    	{
    		if (this.props.like_state == -1)
    		{
    			this.likes_score += 1;
    		}
    		else 
    		{
    			this.likes_score += 2;
    		}
    		this.likeRef.current.style = 'blue'
    		this.dislikeRef.current.style.color = 'black'
    		this.props.like_state = 1;
    	}

    	this.forceUpdate();
	}

	dislikeClicked()
	{
		var that = this;
	    fetch("/dislike", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({user: that.props.data.username, id: this.props.data.id,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	// that.likes_score = data.likes_score;
	    	// that.like_state = data.like_state;
	    	// if (that.like_state == 1)
	    	// {
	    	// 	that.likeRef.current.style.color = 'blue'
	    	// 	that.dislikeRef.current.style.color = 'black'
	    	// }
	    	// else if (that.like_state == 0)
	    	// {
	    	// 	that.likeRef.current.style = 'black'
	    	// 	that.dislikeRef.current.style.color = 'red'
	    	// }
	    	// else
	    	// {
	    	// 	that.likeRef.current.style = 'black'
	    	// 	that.dislikeRef.current.style.color = 'black'		
	    	// }
	    	// that.forceUpdate();
	 	})	
    	if (this.props.like_state == 0)
    	{
    		this.likeRef.current.style = 'black'
    		this.dislikeRef.current.style.color = 'black'	 
    		this.props.like_state = -1;
    		this.likes_score += 1;
    	}
    	else
    	{
    		if (this.props.like_state == -1)
    		{
    			this.likes_score -= 1;
    		}
    		else 
    		{
    			this.likes_score -= 2;
    		}
    		this.likeRef.current.style = 'black'
    		this.dislikeRef.current.style.color = 'red'
    		this.props.like_state = 0;

    	}
    	this.forceUpdate();

	}

	render()
	{
		var like_style = {color:'black'}
		var dislike_style = {color:'black'}
		if (this.props.like_state == 1)
		{
			like_style.color = 'blue'
			dislike_style.color = 'black'
		}
		else if (this.props.like_state == 0)
		{	
			like_style.color = 'black'
			dislike_style.color = 'red'
		}

		return (
			<div>
				<div style={{position:'relative', top:'100px', paddingBottom:'100px', height: 'auto', minHeight: '550px'}}>
					<div style={{position:'relative',float:'left', top:'0px', paddingRight:'20px'}} dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}>
					</div>
					<div style={{left:'10%', top:'20%'}}>
					  	{this.props.data.content}
					</div>

				</div>

				<br/>
				<br/>
				<br/>
				<br/>
				<div>
					<div  className="likes" id = {this.props.data.id} >Likes: {this.likes_score} </div>
					<button ref = {this.likeRef} onClick = {this.likeClicked.bind(this)} type="button" className = "like" id = {this.props.data.id} style = {like_style}>Like</button>
					<button ref = {this.dislikeRef} onClick = {this.dislikeClicked.bind(this)} type="button" className = "unlike" id = {this.props.data.id} style = {dislike_style}>Hate</button>
				</div>
				<meta className = "comment_offset" content = "0" />
			</div>
		);
	}
}

export default class UserPost extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
			<div>
				<StandardHeader/>
				<UserPostContent data = {this.props.data.user_post} like_state = {this.props.data.like_state}/>
				<CommentSection comments = {this.props.data.comments} comment_votes = {this.props.data.comment_votes} post_id = {this.props.data.user_post.id}/>
			</div>
		);
	}
}