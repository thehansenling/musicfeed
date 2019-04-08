import React from 'react';
import StandardHeader from './standard_header.js'
import PostInfo from './post.js'
import utils from './utils.js'



class NewPostSubmission extends React.Component {
	constructor(props)
	{
		super(props);

		this.embedded_content = "";

		this.songEmbedRef = React.createRef();
		this.contentRef = React.createRef();
		this.titleRef = React.createRef();

		this.newPost = "";
		this.div_height = '100px'
	}

	songInput()
	{
		var input = event.target.value;
    	//var song_str = $("#song").val();
		var content_str = this.contentRef.current.value;
	   	if(this.songEmbedRef.current.value != "")
	   	{
	   		this.songEmbedRef.current.style.width = '65%'
	   		this.contentRef.current.style.width = '65%'
	   		this.contentRef.current.style.height = '300px'
	   		this.titleRef.current.style.width = '65%'
	   		this.embedded_content = this.songEmbedRef.current.value;
	   	}
	   	else 
	   	{
	   		this.songEmbedRef.current.style.width = '100%'
	   		this.contentRef.current.style.width = '100%'
	   		this.contentRef.current.style.height = '50px'
	   		this.titleRef.current.style.width = '100%'
	   		this.embedded_content = this.songEmbedRef.current.value;
	   	}
	   	this.forceUpdate();
	}

	contentInput()
	{
		var input = event.target.value;
    	//var song_str = $("#song").val();
		var content_str = this.contentRef.current.value;
	   	if(this.songEmbedRef.current.value != "")
	   	{
	   		this.songEmbedRef.current.style.width = '65%'
	   		this.contentRef.current.style.width = '65%'
	   		this.contentRef.current.style.height = '300px'
	   		this.titleRef.current.style.width = '65%'
	   		this.embedded_content = this.songEmbedRef.current.value;
	   	}
	   	else 
	   	{
	   		this.songEmbedRef.current.style.width = '100%'
	   		this.contentRef.current.style.width = '100%'
	   		this.contentRef.current.style.height = '50px'
	   		this.titleRef.current.style.width = '100%'
	   	}

    	if (content_str != "")
    	{
    		this.contentRef.current.style.height = '300px'
    	}
    	else
    	{
    		this.contentRef.current.style.height = '50px'
    	}
	   	this.forceUpdate();


	}


	submitPost()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		var that = this;
		fetch("/post", {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Basic',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({song: this.songEmbedRef.current.value, 
								  content: this.contentRef.current.value, 
								  title: this.titleRef.current.value})})
			.then(function(response) { return response.json();})
			.then(function (data) { 

			that.songEmbedRef.current.value = "" 
			that.contentRef.current.value = "" 
			that.titleRef.current.value = ""
			location.reload(true);
		})
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		}
	}

	closeNewPost()
	{
		this.newPost = undefined;
		this.embedded_content = ""
		this.forceUpdate();
	}

	beginNewPost()
	{
		this.newPost = <div key = "what" id = "post" style ={{top:'0px',position:'relative', paddingBottom:'30px', width:'980px'}}  autoComplete="off">
			Song/Playlist: 
			<br/>
			<input ref = {this.songEmbedRef} onChange = {this.songInput.bind(this)} id="song" type="text" name="song" style={{width:'100%'}}/>
			<br/>
				Title:
			<br/>
			<input ref = {this.titleRef} id="title" type="text" name="title" style={{width:'100%'}}/>  
			<br/>
			<textarea onChange = {this.contentInput.bind(this)} ref = {this.contentRef} id = "content" name="content" rows="10" cols="90" style={{position:'relative',width:'100%',height:'50px'}}></textarea>
			<br/>
			<button style = {{float:'left'}} onClick = {this.submitPost.bind(this)} id = "post_button" type="button">Post</button>
			<button onClick = {this.closeNewPost.bind(this)}> Close </button>
			<br/>
			
			
			<meta className = "post_number" content = "0"/>
			<meta className = "non_priority_post_number" content = "0"/>
			<meta className = "global_post_number" content = "0"/>
			<meta className = "non_priority_global_post_number" content = "0"/>
		</div>
		this.forceUpdate();
	}

	render()
	{
		return (
			<div style = {{position:'relative', margin: '0 auto', width:'980px', top:'100px'}}>
			<button style = {{ width:'100px', position:'relative'}} onClick = {this.beginNewPost.bind(this)} > new post </button>

			{this.newPost}
			<div id="showsong" style = {{position:'relative',top:'-443px',left:'680px'}} dangerouslySetInnerHTML={this.renderiframe(this.embedded_content)}>
			</div>
			</div>
		);
	}
}

export default class Feed extends React.Component{
	constructor(props)
	{
		super(props);
		this.loading_posts_semaphor = false;
		this.offset = 0;
		this.non_priority_offset = 0;
		this.global_offset = 0;
		this.non_priority_global_offset = 0;
		this.postsRef = React.createRef();
	}

	componentDidMount() 
	{
	    window.addEventListener('scroll', this.handleScroll.bind(this));
	    this.updateOffsets(this.props.data.songs)
	}

	componentWillUnmount() 
	{
	    window.removeEventListener('scroll', this.handleScroll.bind(this));
	}

	updateOffsets(songs)
	{
    	for (var song of songs)
    	{
    		if (song.offset_type == 0)
    		{
    			++this.offset;
    		}
    		else if  (song.offset_type == 1)
    		{
    			++this.non_priority_offset;
    		}
    		else if (song.offset_type == 2)
    		{
    			++this.global_offset;
    		}
    		else 
    		{
    			++this.non_priority_global_offset;
    		}
    	}
	}

	handleScroll() {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_posts_semaphor) 
		{
			var that = this

			this.loading_posts_semaphor = true
		    fetch("/load_feed", {
		        method: "POST",
		        headers: {
		        	'Accept': 'application/json',
		        	'Authorization': 'Basic',
		        	'Content-Type': 'application/json',
		        },
		        body: JSON.stringify({offset:this.offset, 
		        					  non_priority_offset: this.non_priority_offset,
		        					  global_offset: this.global_offset,
		        					  non_priority_global_offset: this.non_priority_global_offset})})
		    .then(function(response) { return response.json();})
		    .then(function (data) { 
		    	that.updateOffsets(data.songs)
		    	that.postsRef.current.addPosts(data.songs, data.likes, data.num_comments)
		    	that.loading_posts_semaphor = false;
		 	})
		}
	}


	render()
	{
		return (
			<div>

				<NewPostSubmission />
				<PostInfo ref = {this.postsRef} songs = {this.props.data.songs} likes = {this.props.data.likes} num_comments = {this.props.data.num_comments}/>
			</div>
		);
	}

}