import React from 'react';
import StandardHeader from './standard_header.js'
import CommentSection from './comments.js'
import utils from './utils.js'
import tag_utils from './tag_utils.js'

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
		this.potential_tags = []
		if (this.props.username == this.props.data.username)
		{
			this.edit_content = <button onClick={this.editContent.bind(this)}> Edit Content </button>;
			var tags_temp = JSON.parse(this.props.data.tags)
			var tag_keys = Object.keys(tags_temp)
			for (var i = 0; i < tag_keys.length; ++i)
			{
				if (tags_temp[tag_keys[i]].length >= 5 )
				{
					this.potential_tags.push(tags_temp[tag_keys[i]])
				}

			}
		}

		this.tagFlag = false
		this.currentTag = ""
		this.tagList = []
		this.artists = []
		this.users = []
		this.artistSearch = false
		this.currentArtist = ""
		
		this.artistFlag = false
		this.lastContentSize = 0
		this.tagged = false
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}

	editContent()
	{
		this.edit_content = <div>
								<textarea onChange = {this.contentInput.bind(this)} ref = {this.contentRef} id = "content" name="content" rows="15" cols="117" >{this.props.data.content}</textarea>
								<button onClick = {this.submitEditComment.bind(this)} style={{position:'relative'}} type='button' class='submit_new_comment' id = {this.props.comment_id}>submit</button>
								<button onClick = {this.closeEditComment.bind(this)} style={{position:'relative'}} type='button' class='close_new_comment' id = {this.props.comment_id}>close</button>
							</div>
		this.forceUpdate()
	}

	contentInput()
	{
		var input = event.target.value;
    	//var song_str = $("#song").val();
		var content_str = this.contentRef.current.value;
		//update and prune tags list 
		tag_utils.getTags(this)
    	this.lastContentSize = this.contentRef.current.value.length
	   	this.forceUpdate();
	}

	selectTag(e)
	{
		tag_utils.tagClicked(this, e)
	}

	closeEditComment()
	{
		this.edit_content = <button onClick={this.editContent.bind(this)}> Edit Content </button>;
		this.tagFlag = false
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
	        					  text: this.contentRef.current.value,
	        					  potentialTags: this.potential_tags})})
	    .then(function(response) { return response.json();})
	    .then(function (data) { 

	    })
	    this.tagFlag = false
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
	        body: JSON.stringify({user: that.props.data.username, id: this.props.data.id, name: this.props.data.title})})
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
	        body: JSON.stringify({user: that.props.data.username, id: this.props.data.id, name: that.props.data.title})})
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
		// this.props.data.content.split('\n').map((item, i) => {
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
		// 		all_content.push(<a key = {current_index} href = {tags[tag_indices[0]][4]}>{tag}</a>)
		// 		tag_indices.splice(0,1);
		// 	}
		// 	total_index += item.length 
		// 	all_content.push(item.substring(index, item.length))
		// 	content_div.push(<p style = {{minHeight:'26.67px'}} key={i}>{all_content}</p>);
		// })
		content_div = tag_utils.formatContent(this.props.data.content, this.props.data.tags)
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

		var tag_display = 'none'
		if (this.tagFlag)
		{
			tag_display = ''
		}

		return (
			<div style = {{background: 'white', position:'relative', top:'85px', paddingLeft:'10px', height: 'auto', minHeight: '550px', maxWidth:'980px', paddingBottom:'50px', paddingRight:'10px', left:'5%', borderBottom: 'solid black 3px', borderRadius: '4px'}}>
				<div style = {{}} >

			<div style = {{display:'flex', flexDirection:'row'}}>
			<div style=  {{width:'300px', paddingLeft:'10px', paddingTop:'10px'}}>
				<div style = {{float:'left'}}> <a href ={"/user/" + this.props.data.username} > {this.props.data.username}</a></div>
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

				<div style = {{position:'fixed', width: '200px', height:'300px', right:'10%', top:'200px', backgroundColor:'white', display:tag_display, zIndex:15, overflow:'scroll'}} >
					{this.tagList}
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