import React from 'react';
import StandardHeader from './standard_header.js'
import CommentSection from './comments.js'
import utils from './utils.js'

class GlobalPostContent extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.album_songs = []
		this.likes_score = this.props.data.likes - props.data.dislikes;
		this.likeRef = React.createRef();
		this.dislikeRef = React.createRef();
		//this.like_state = -1
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}

	generateAlbumSongs()
	{
		//for (key of Object.keys(JSON.parse(data[0].data)))
		for (var song of Object.keys(JSON.parse(this.props.data.data)))
		{
			this.album_songs.push(<div style = {{padding:'0px'}}> {song + "."} <a href = {"/post/" + this.props.data.artist + "/" + JSON.parse(this.props.data.data)[song]}> {JSON.parse(this.props.data.data)[song]} </a></div>)
		}
	}

	likeClicked()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		var that = this;
	    fetch("/global_like", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id: this.props.data.post_id,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	that.likes_score = data.likes_score;
	    	that.like_state = data.like_state;
	    	if (that.like_state == 1)
	    	{
	    		that.likeRef.current.style.color = 'blue'
	    		that.dislikeRef.current.style.color = 'black'
	    	}
	    	else if (that.like_state == 0)
	    	{
	    		that.likeRef.current.style = 'black'
	    		that.dislikeRef.current.style.color = 'red'
	    	}
	    	else
	    	{
	    		that.likeRef.current.style = 'black'
	    		that.dislikeRef.current.style.color = 'black'	    		
	    	}
	    	that.forceUpdate();
	 	})	
	}

	dislikeClicked()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		var that = this;
	    fetch("/global_dislike", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id: this.props.data.post_id,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	that.likes_score = data.likes_score;
	    	that.like_state = data.like_state;
	    	if (that.like_state == 1)
	    	{
	    		that.likeRef.current.style.color = 'blue'
	    		that.dislikeRef.current.style.color = 'black'
	    	}
	    	else if (that.like_state == 0)
	    	{
	    		that.likeRef.current.style = 'black'
	    		that.dislikeRef.current.style.color = 'red'
	    	}
	    	else
	    	{
	    		that.likeRef.current.style = 'black'
	    		that.dislikeRef.current.style.color = 'black'		
	    	}
	    	that.forceUpdate();
	 	})	
	}


	render()
	{
		var song = <div> {this.props.data.song + " by "} <a href = {"/artist/" + this.props.data.artist}> {this.props.data.artist} </a> </div>
		if (this.props.data.type == 1)
		{
			song = ""
			this.generateAlbumSongs();
		}



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

						<div>
							{song}
							<div> Album: {this.props.data.album} </div>
							<div> Released on: {this.props.data.release_date} </div>
							{this.album_songs}
						</div>

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

export default class GlobalPost extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
			<div>
				<GlobalPostContent data = {this.props.data.global_post} like_state = {this.props.data.like_state}/>
				<CommentSection comments = {this.props.data.comments} comment_votes = {this.props.data.comment_votes} post_id = {this.props.data.global_post.post_id} posts = {this.props.data.user_posts} global_post = {this.props.data.global_post} />
			</div>
		);
	}
}