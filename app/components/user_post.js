import React from 'react';
import StandardHeader from './standard_header.js'
import CommentSection from './comments.js'
import utils from './utils.js'
import tag_utils from './tag_utils.js'
import {isMobile} from 'react-device-detect';

class UserPostContent extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.likes_score = this.props.data.likes - props.data.dislikes;
		this.likeRef = React.createRef();
		this.dislikeRef = React.createRef();
		this.like_state = -1

		this.up_color = "#2F3846"
		this.down_color = "#2F3846"
		this.edit_content = <div></div>
		this.contentRef = React.createRef()
		this.potential_tags = []
		if (this.props.username == this.props.data.username)
		{
			this.edit_content = <button onClick={this.editContent.bind(this)}> Edit Content </button>;

			var tags_temp = {}
			
			if (this.props.data.tags != undefined)
			{
				tags_temp = JSON.parse(this.props.data.tags)
			}
			

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
		this.songs_and_albums = []
		
		this.artistFlag = false
		this.lastContentSize = 0
		this.tagged = false

		this.postRef = React.createRef()
		this.post_height = '580px'
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
		this.lastContentSize = this.props.data.content.length
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
	        					  poster: this.props.data.username,
	        					  title: this.props.data.title,
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
    		this.up_color = "#2F3846"
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
    		this.up_color = "#1485cc"
    		this.down_color = "#2F3846"
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
    		this.up_color = "#2F3846"
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
    		this.down_color = "#dd3d3d"
    		this.up_color = "#2F3846"
    		this.props.like_state = 0;

    	}
    	this.forceUpdate();

	}

	componentDidMount() {
	    this.post_height = this.postRef.current.clientHeight +25
	    this.forceUpdate();
	}	


	render()
	{
		var like_style = {color:'black'}
		var dislike_style = {color:'black'}
		if (this.props.like_state == 1)
		{
			like_style.color = 'blue';
			this.up_color = "#1485cc"
		}
		else if (this.props.like_state == 0)
		{
			dislike_style.color = 'red';
			this.down_color = "#dd3d3d"
		}


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

		var split_artist = this.props.data.artist.split('^')[0]
		var content_link = "/post/" + split_artist + "/" + this.props.data.song
		var content_name = this.props.data.song
		if (this.props.data.song == "NO_SONG_ALBUM_ONLY")
		{
			content_link = "/album/" + split_artist + "/" + this.props.data.album
			content_name = this.props.data.album
		}

		var title_size = '24px'
		var content_size = '20px'
		var date_size = '17px'
		var max_content_height = '450px'
		var content_name_size = '1.2em'
		var username_size = '24px'

		var left_flex = ''
		var right_flex = ''
		var content_float = 'left'
		var icon_font_size = '16px'
		var icons_height = '24px'
		if (isMobile)
		{
			username_size = '1.1em'
			title_size = '2em'
			date_size = '.7em'
			content_size = '2.2em'
			content_name_size = '.8em'
			max_content_height = '615px'

			left_flex = '4'
			right_flex = '6'
			content_float = 'left'

			icons_height = '48px'
			icon_font_size = '1em'
		}

		var content_information = <div key = "content_information" style = {{flex:left_flex, display:'flex', flexDirection:'row', width:'330px', paddingLeft:'10px', borderRadius:'7px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px', float:content_float}}>
							<div style = {{paddingRight:'10px'}}>
								<div style = {{display:'flex', flexDirection:'row'}}>
									<div style = {{width:'65px', height:'65px', backgroundColor:this.props.user_profile, borderRadius:'50%'}}>
									</div>
									<div style = {{paddingLeft:'20px'}}>
										<div style = {{fontSize:username_size, fontWeight:'bold', whiteSpace:'normal'}}> <a href ={"/user/" + this.props.data.username} > {this.props.data.username}</a></div>
										<div style = {{fontSize:date_size, paddingRight:'10px'}}>{ utils.monthNames[parseInt(date.getMonth())]+ " " + date.getDate() + ", " + date.getFullYear()}</div>
									</div>
								</div>

								<div style = {{paddingTop:'30px'}}><span dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}></span>
								</div>
								<div style = {{width:'300px', display:'flex', flexDirection:'row', paddingTop:'5px', fontSize:content_name_size, color:'#2F3846', opacity:'.6'}}>
									<a style = {{height:'26.66px',whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} href = {"/artist/" + split_artist}> {split_artist} </a>
									-
									<a style = {{height:'26.66px',whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} href = {content_link}> {content_name} </a>  
								</div>
								<div style = {{height:'35px', display:'flex', flexDirection:'row', zIndex:'9'}}>
									<div style = {{width:'15px', height:'30px'}}></div>
									<svg onClick = {this.likeClicked.bind(this)} width={parseInt(icons_height) * 0.58333} height={icons_height} viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg" color = 'blue'>
									<path d="M8.70711 0.987356C8.31658 0.596832 7.68342 0.596832 7.29289 0.987356L0.928931 7.35132C0.538407 7.74184 0.538407 8.37501 0.928931 8.76553C1.31946 9.15606 1.95262 9.15606 2.34315 8.76553L8 3.10868L13.6569 8.76553C14.0474 9.15606 14.6805 9.15606 15.0711 8.76553C15.4616 8.37501 15.4616 7.74184 15.0711 7.35132L8.70711 0.987356ZM9 26.3126L9 1.69446L7 1.69446L7 26.3126L9 26.3126Z" fill={this.up_color}/>
									</svg>
									<div style = {{minWidth:'30px', height:'30px', verticalAlign: 'middle', textAlign: 'center', position: 'relative', top: '0px', fontSize: icon_font_size, fontWeight:'bold'}}><a href = {"/user/" + this.props.data.username + "/" + this.props.data.id + "/likes"} >{this.likes_score} </a></div>

									<svg onClick = {this.dislikeClicked.bind(this)} width={parseInt(icons_height) * 0.58333} height={icons_height} viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M7.29289 26.0197C7.68342 26.4102 8.31658 26.4102 8.70711 26.0197L15.0711 19.6557C15.4616 19.2652 15.4616 18.632 15.0711 18.2415C14.6805 17.851 14.0474 17.851 13.6569 18.2415L8 23.8984L2.34315 18.2415C1.95262 17.851 1.31946 17.851 0.928932 18.2415C0.538408 18.632 0.538408 19.2652 0.928932 19.6557L7.29289 26.0197ZM7 0.694489L7 25.3126H9L9 0.694489L7 0.694489Z" fill={this.down_color}/>
									</svg>

									<div style = {{width:'10px', height:'30px', borderRight: '1px solid rgba(0, 0, 0, 0.09)'}}></div>
									<div style = {{width:'10px', height:'30px'}}></div>
									<div style = {{}}><img src="/speech_bubble.png" width={parseInt(icons_height) * 0.58333} height={icons_height} alt=""/></div>

									<div style = {{width:'30px', height:'30px', verticalAlign: 'middle', textAlign: 'center', position: 'relative', top: '0px', fontSize: icon_font_size, fontWeight:'bold'}}> {this.props.num_comments} </div>
									<div style = {{width:'30px', height:'30px', verticalAlign: 'middle', textAlign: 'center', position: 'relative', top: '0px', fontSize: icon_font_size, fontWeight:'bold'}}>
										{this.bump_button}
									</div>
								</div>	
							</div>	

							<div style = {{width:'10px', height:'515px', borderLeft:'1px solid rgba(0, 0, 0, 0.09)'}}>
							</div>	
						</div>
		

		var title_div = <div key = "title" style = {{fontWeight:'bold', fontSize:title_size, margin: '0px auto', paddingBottom:'10px'}}>
							{this.props.data.title}
						</div>
		var content_div = []

		content_div = [content_information, title_div]

		content_div = tag_utils.formatContent(this.props.data.content, this.props.data.tags, content_div)
		return (
			<div ref = {this.postRef} key = {this.props.data.post_id} style = {{border: '1px solid #F1F1F1', borderRadius: '7px', background:'white', minHeight:'580px', position:'relative', top:'10px', left:'10px', margin:'0px auto'}}>

					<div style = {{paddingTop:'30px', paddingLeft:'10px', paddingRight:'10px', position:'relative', minHeight:'545px', display:'flex', flexDirection:'row'}}>

						<div style = {{flex:right_flex}}>

							<div style = {{minHeight:'455px', whiteSpace:'pre-wrap', fontSize:content_size}}>
								{content_div}
							</div>
						</div>
					</div>

			</div>

		);
	}
}

export default class UserPost extends React.Component
{
	constructor(props)
	{
		super(props);
		this.postRef = React.createRef();
		this.post_height = '600px'
	}

	componentDidMount() 
	{
		this.props.mixpanel.track("User Post Page", {"Post ID":this.props.data.user_post.id})
	}

	render()
	{
		var top_padding = ''
		if (isMobile)
		{
			top_padding = '12%'
		}

		var post_width = '1000px'

		if (isMobile)
		{
			post_width = '100%'
		}
		return (
			<div>
				<div style = {{position:'relative', margin:'0px auto', width:post_width, paddingTop:top_padding}}>
					<UserPostContent ref = {this.postRef} data = {this.props.data.user_post} like_state = {this.props.data.like_state} num_comments = {this.props.data.num_comments} username = {this.props.data.username} user_profile = {this.props.data.user_profile} mixpanel = {this.props.mixpanel}/>
				</div>
				<div style = {{margin:'0px auto', width:post_width, paddingTop:"40px"}}>
					<CommentSection comments = {this.props.data.comments} comment_votes = {this.props.data.comment_votes} post_id = {this.props.data.user_post.id} post_data = {this.props.data.user_post} mixpanel = {this.props.mixpanel} username = {this.props.data.username}/>
				</div>
			</div>
		);
	}
}