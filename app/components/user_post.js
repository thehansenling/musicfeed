import React from 'react';
import StandardHeader from './standard_header.js'
import CommentSection from './comments.js'
import utils from './utils.js'

class UserPostContent extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.likes_score = this.props.data.likes - props.data.dislikes;
		this.likeRef = React.createRef();
		this.dislikeRef = React.createRef();
		this.like_state = -1

		this.up_image = "/small_up.png"
		this.down_image = "/small_down.png"
		this.edit_content = <div></div>
		this.contentRef = React.createRef()
		if (this.props.username == this.props.data.username)
		{
			this.edit_content = <button onClick={this.editContent.bind(this)}> Edit Content </button>;

		}
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}

	editContent()
	{
		this.edit_content = <div>
								<textarea ref = {this.contentRef} id = "content" name="content" rows="15" cols="117" >{this.props.data.content}</textarea>
								<button onClick = {this.submitEditComment.bind(this)} style={{position:'relative'}} type='button' class='submit_new_comment' id = {this.props.comment_id}>submit</button>
								<button onClick = {this.closeEditComment.bind(this)} style={{position:'relative'}} type='button' class='close_new_comment' id = {this.props.comment_id}>close</button>
							</div>
		this.forceUpdate()
	}

	closeEditComment()
	{
		this.edit_content = <button onClick={this.editContent.bind(this)}> Edit Content </button>;
		this.forceUpdate()
	}

	submitEditComment()
	{
		var that = this;
		var submit_text = this.contentRef.current.value
		this.props.data.content = submit_text;
	    fetch("/edit_content", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },

	        body: JSON.stringify({id: this.props.data.post_id, 
	        					  text: this.contentRef.current.value})})
	    .then(function(response) { return response.json();})
	    .then(function (data) { 

	    })

	    this.closeEditComment();
	}

	likeClicked()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
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
	    	//that.forceUpdate();
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

    	this.forceUpdate();
	}

	dislikeClicked()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
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
	    	//that.forceUpdate();
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
		var like_style = {color:'black'}
		var dislike_style = {color:'black'}
		if (this.props.like_state == 1)
		{
			like_style.color = 'blue';
			this.up_image = "/small_up_on.png"
		}
		else if (this.props.like_state == 0)
		{
			dislike_style.color = 'red';
			this.down_image = "/small_down_on.png"
		}

		var content_div = []
		this.props.data.content.split('\n').map((item, i) => {
			content_div.push(<p key={i}>{item}</p>);
		})

		var post_id = this.props.data.id;
		var date = new Date(this.props.data.timestamp)
		//<div style = {{position:'relative', textAlign:'center', paddingTop:'8px', fontSize:'3em'}}>{this.props.data.title}</div>
		var content_url = "/post/" + this.props.data.artist + "/" + this.props.data.song;
		var content_name = this.props.data.song;

		if (this.props.data.song == "NO_SONG_ALBUM_ONLY")
		{
			content_url = "/album/" + this.props.data.artist + "/" + this.props.data.album;
			content_name = this.props.data.album;
		}

		var artist_names = []
		this.props.data.artist.split('^').map((item, i) => {
			artist_names.push(<a key = {i} href ={"/artist/" + item} > {item} </a>);
			artist_names.push(',')
		})
		artist_names = artist_names.slice(0, artist_names.length-1)

		return (
			<div style = {{background: 'white', position:'relative', top:'85px', paddingLeft:'10px', height: 'auto', minHeight: '550px', maxWidth:'980px', paddingBottom:'50px', paddingRight:'10px', left:'5%', borderBottom: 'solid black 3px', borderRadius: '4px'}}>
				<div style = {{}} >

			<div style = {{display:'flex', flexDirection:'row'}}>
			<div style=  {{width:'300px', paddingLeft:'10px', paddingTop:'10px'}}>
				<div style = {{float:'left', fontFamily:'Playfair Display'}}> <a href ={"/user/" + this.props.data.username} > {this.props.data.username}</a></div>
				<div style = {{float:'right', paddingRight:'10px'}}>{(parseInt(date.getMonth()) + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</div>
				<div style = {{clear:'both'}}>{artist_names}</div>
				<div> <a href = {content_url} >{content_name} </a></div>
			</div>
			<div style = {{paddingTop:'8px', width:'680px', margin: '0px auto', textAlign:'center', fontSize:'36px'}}>{this.props.data.title}</div>

			</div>

				</div>
				<div style = {{display:'inlineBlock'}}>
					<div style={{float:'left',position:'relative', top:'0px', paddingRight:'20px'}} dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}>
					</div>
					
					{content_div}
					{this.edit_content}
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
				// <div>
				// 	<div  className="likes" id = {this.props.data.id} >Likes: {this.likes_score} </div>
				// 	<button ref = {this.likeRef} onClick = {this.likeClicked.bind(this)} type="button" className = "like" id = {this.props.data.id} style = {like_style}>Like</button>
				// 	<button ref = {this.dislikeRef} onClick = {this.dislikeClicked.bind(this)} type="button" className = "unlike" id = {this.props.data.id} style = {dislike_style}>Hate</button>
				// </div>
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
				<UserPostContent data = {this.props.data.user_post} like_state = {this.props.data.like_state} num_comments = {this.props.data.num_comments} username = {this.props.data.username}/>
				<CommentSection comments = {this.props.data.comments} comment_votes = {this.props.data.comment_votes} post_id = {this.props.data.user_post.id}/>
			</div>
		);
	}
}