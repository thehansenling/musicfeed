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
		this.up_image = "/small_up.png"
		this.down_image = "/small_down.png"
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
			this.album_songs.push(<div key = {JSON.parse(this.props.data.data)[song]} style = {{padding:'0px'}}> {song + "."} <a href = {"/post/" + this.props.data.artist + "/" + JSON.parse(this.props.data.data)[song]}> {JSON.parse(this.props.data.data)[song]} </a></div>)
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
	    	that.forceUpdate();
	 	})	
    	if (this.props.like_state == 1)
    	{
       		this.likes_score -= 1;
    		// this.likeRef.current.style = 'black'
    		// this.dislikeRef.current.style.color = 'black'
    		this.props.like_state = -1;
    		this.up_image = "/small_up.png"
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
    		// this.likeRef.current.style = 'blue'
    		// this.dislikeRef.current.style.color = 'black'
       		this.up_image = "/small_up_on.png"
    		this.down_image = "/small_down.png"
    		this.props.like_state = 1;
    	}
    	this.forceUpdate()

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
	    	that.forceUpdate();
	 	})	
    	if (this.props.like_state == 0)
    	{
    		// this.likeRef.current.style = 'black'
    		// this.dislikeRef.current.style.color = 'black'	 
       		this.down_image = "/small_down.png"
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
    		// this.likeRef.current.style = 'black'
    		// this.dislikeRef.current.style.color = 'red'
       		this.down_image = "/small_down_on.png"
    		this.up_image = "/small_up.png"
    		this.props.like_state = 0;

    	}
    	this.forceUpdate();
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

			// <div>
			// 	<div style={{position:'relative', top:'100px', paddingBottom:'100px', height: 'auto', minHeight: '550px'}}>
			// 		<div style={{position:'relative',float:'left', top:'0px', paddingRight:'20px'}} dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}>
			// 		</div>
			// 		<div style={{left:'10%', top:'20%'}}>

			// 			<div>
			// 				{song}
			// 				<div> Album: {this.props.data.album} </div>
			// 				<div> Released on: {this.props.data.release_date} </div>
			// 				{this.album_songs}
			// 			</div>

			// 		</div>
			// 	</div>
			// 	<br/>
			// 	<br/>
			// 	<br/>
			// 	<br/>
			// 	<div>
			// 		<div  className="likes" id = {this.props.data.id} >Likes: {this.likes_score} </div>
			// 		<button ref = {this.likeRef} onClick = {this.likeClicked.bind(this)} type="button" className = "like" id = {this.props.data.id} style = {like_style}>Like</button>
			// 		<button ref = {this.dislikeRef} onClick = {this.dislikeClicked.bind(this)} type="button" className = "unlike" id = {this.props.data.id} style = {dislike_style}>Hate</button>
			// 	</div>
			// 	<meta className = "comment_offset" content = "0" />
			// </div>

		return (
			<div style = {{background: 'white', position:'relative', top:'85px', paddingLeft:'10px', height: 'auto', minHeight: '550px', maxWidth:'1000px', paddingBottom:'50px', paddingRight:'10px', paddingTop:'10px', left:'5%', borderBottom: 'solid black 3px', borderRadius: '4px'}}>

				<div style = {{display:'inlineBlock'}}>
					<div style={{float:'left',position:'relative', top:'0px', paddingRight:'20px'}} dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}>
					</div>
					
					<div>
						{song}
						<div> Album: <a href = {"/album/" + this.props.data.artist + "/" + this.props.data.album}> {this.props.data.album} </a> </div>
						<div> Released on: {this.props.data.release_date} </div>
						{this.album_songs}
					</div>

				</div>
				<div style = {{clear:'both', height:'35px'}}>
					<div style = {{float:'left', width:'15px', height:'30px'}}></div>
					<div style = {{float:'left'}}><img onClick = {this.likeClicked.bind(this)} src={this.up_image} width="30" height="30" alt=""/></div>
					<div style = {{width:'60px', height:'30px', float:'left', verticalAlign: 'middle', textAlign: 'center', width:'60px', position: 'relative', top: '0px', fontSize: '21px'}}>{this.likes_score}</div>
					<div style = {{float:'left'}}><img onClick = {this.dislikeClicked.bind(this)} src={this.down_image} width="30" height="30" alt=""/></div>
					<div style = {{float:'left', width:'30px', height:'30px', borderRight: '1px solid black'}}></div>
					<div style = {{float:'left', width:'30px', height:'30px'}}></div>
					<div style = {{float:'left'}}><img src="/small_comment.png" width="30" height="30" alt=""/></div>
					<div style = {{width:'60px', height:'30px', float:'left', verticalAlign: 'middle', textAlign: 'center', width:'80px', position: 'relative', top: '0px', fontSize: '21px'}}>{this.props.num_comments}</div>
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