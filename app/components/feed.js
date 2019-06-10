import React from 'react';
import StandardHeader from './standard_header.js'
import PostInfo from './post.js'
import utils from './utils.js'
import tag_utils from './tag_utils.js'

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
		this.containerRef = React.createRef()
		this.postContentRef = React.createRef()
		this.tagFlag = false
		this.currentTag = ""
		this.tagList = []
		this.artists = []
		this.songs_and_albums = []
		this.users = []
		this.artistSearch = false
		this.currentArtist = ""
		this.potential_tags = []
		this.artistFlag = false
		this.lastContentSize = 0
		this.tagged = false
	}

	songInput()
	{
		var input = event.target.value;
    	//var song_str = $("#song").val();
		var content_str = this.contentRef.current.value;
	   	if(this.songEmbedRef.current.value != "")
	   	{
	   		// this.songEmbedRef.current.style.width = '670px'
	   		// this.contentRef.current.style.width = '670px'
	   		// this.contentRef.current.style.height = '300px'
	   		// this.titleRef.current.style.width = '670px'
	   		// this.embedded_content = this.songEmbedRef.current.value;
	   		this.postContentRef.current.style.display = ''
	   		this.containerRef.current.style.height = '500px'
	   	}
	   	else 
	   	{
	   		// this.songEmbedRef.current.style.width = '980px'
	   		// this.contentRef.current.style.width = '980px'
	   		// this.contentRef.current.style.height = '50px'
	   		// this.titleRef.current.style.width = '980px'
	   		this.embedded_content = this.songEmbedRef.current.value;
	   		this.postContentRef.current.style.display = 'none'
	   		this.containerRef.current.style.height = '140px'
	   	}
	   	
	   	this.forceUpdate();
	}

	contentInput()
	{
		var input = event.target.value;
    	//var song_str = $("#song").val();
		var content_str = this.contentRef.current.value;
		//update and prune tags list 
		tag_utils.getTags(this)


	   	if(this.songEmbedRef.current.value != "")
	   	{
	   		// this.songEmbedRef.current.style.width = '670px'
	   		// this.contentRef.current.style.width = '670px'
	   		// this.contentRef.current.style.height = '300px'
	   		// this.titleRef.current.style.width = '670px'
	   		// this.embedded_content = this.songEmbedRef.current.value;
	   	}
	   	else 
	   	{
	   		// this.songEmbedRef.current.style.width = '980px'
	   		// this.contentRef.current.style.width = '980px'
	   		// this.contentRef.current.style.height = '50px'
	   		// this.titleRef.current.style.width = '980px'
	   	}

    	this.lastContentSize = this.contentRef.current.value.length
	   	this.forceUpdate();
	}

	selectTag(e)
	{
		tag_utils.tagClicked(this, e)
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
								  title: this.titleRef.current.value,
								  potentialTags: this.potential_tags}
								  )})
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
   		this.postContentRef.current.style.display = 'none'
   		this.containerRef.current.style.height = '140px'
   		this.songEmbedRef.current.value = "" 
		// this.newPost = undefined;
		// this.embedded_content = ""
		this.forceUpdate();
	}

	beginNewPost()
	{
		// Song/Album Spotify Embed Code: 
		// <br/>
		// <input ref = {this.songEmbedRef} onChange = {this.songInput.bind(this)} id="song" type="text" name="song" style={{width:'980px'}}/>
		// <br/>
		this.newPost = <div key = "what" id = "post" style ={{top:'0px',position:'relative', paddingBottom:'30px', width:'680px'}}  autoComplete="off">
			<div style = {{display:'flex', flexDirection:''}}>
				<label>Title:</label>
				<input ref = {this.titleRef} id="title" type="text" name="title" style={{width:'980px'}}/>  
			</div>
			<br/>
				Content:
			<br/>
			<textarea onChange = {this.contentInput.bind(this)} ref = {this.contentRef} id = "content" name="content" rows="10" cols="90" style={{position:'relative',width:'980px',height:'50px'}}></textarea>
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
	//<button style = {{ width:'100px', position:'relative'}} onClick = {this.beginNewPost.bind(this)} > new post </button>
	render()
	{
		var tag_display = 'none'
		if (this.tagFlag)
		{
			tag_display = ''
		}
		return (
			<div ref = {this.containerRef} style = {{position:'relative', margin: '0 auto', width: '735px', height:'140px', backgroundColor:'white', border: '1px solid #F1F1F1', borderRadius:'7px', top:'14px'}}>
				<div style = {{fontFamily:'RobotoRegular', fontSize:'20px', color:'rgba(47, 56, 70, 0.58)', paddingLeft:'18px', paddingTop:'15px'}}> Create Post </div>
 				<div style = {{display:'flex', flexDirection:'row', paddingLeft:'18px', paddingTop:'16px'}}>
	 				<div style = {{width:'65px', height:'65px', backgroundColor:'#178275', borderRadius:'50%'}}></div>
	 				<input ref = {this.songEmbedRef} onChange = {this.songInput.bind(this)} style = {{borderBottom:'1px solid rgba(0, 0, 0, 0.09)', borderTop:'none', borderLeft:'none', borderRight:'none', left:'16px', position:'relative', width:'618px', fontSize:'24px'}}></input>
 				</div>

				<div ref = {this.postContentRef} id = "post" style ={{top:'0px',position:'relative', paddingBottom:'30px', width:'703px', display:'none', left:'16px'}}  autoComplete="off">
					<div style = {{position:'relative', top:'16px'}}> Title: </div>
					<br/>
					<input ref = {this.titleRef} id="title" type="text" name="title" style={{width:'703px', borderTop:'none', borderLeft:'none', borderRight:'none', borderBottom:'1px solid rgba(0, 0, 0, 0.09)'}}/>  
					<br/>
						Content:
					<br/>
					<textarea onChange = {this.contentInput.bind(this)} ref = {this.contentRef} id = "content" name="content" rows="10" cols="90" style={{position:'relative',width:'703px',height:'238px', borderTop:'none', borderLeft:'none', borderRight:'none', borderBottom:'1px solid rgba(0, 0, 0, 0.09)'}}></textarea>
					<br/>
					<button style = {{float:'left'}} onClick = {this.submitPost.bind(this)} id = "post_button" type="button">Post</button>
					<button onClick = {this.closeNewPost.bind(this)}> Close </button>
					<br/>
					
				</div>

 				<div style = {{display:'flex', flexDirection:'row'}}>
					{this.newPost}
					<div id="showsong" style = {{position:'relative', top:'24px'}} dangerouslySetInnerHTML={this.renderiframe(this.embedded_content)}>
					</div>
				</div>

				<div style = {{position:'fixed', width: '200px', height:'300px', right:'10%', top:'200px', backgroundColor:'white', display:tag_display, zIndex:15, overflow:'scroll'}} >
					{this.tagList}
				</div>
			</div>
		);
	}
}

function SetSpotifySize(iframe_string, width, height)
{
	return iframe_string.substring(0, iframe_string.indexOf("width") + 7) + width + 
	iframe_string.substring(iframe_string.indexOf("height") - 2, iframe_string.indexOf("height") + 7) + 
	height + iframe_string.substring(iframe_string.indexOf("frameborder") - 2, iframe_string.length)
	this.props.data[i].embedded_content = iframe_string
}

class Trending extends React.Component {
	constructor(props)
	{
		super(props)
		this.global_post_index = 0;
		this.state = { global_post_index: 0 };
		this.global_posts = []
		this.trending_posts = []
		for (var i = 0; i < this.props.data.length; ++i)
		{
			var iframe_string = this.props.data[i].embedded_content;

			this.props.data[i].embedded_content = SetSpotifySize(iframe_string, 250, 330)				


			this.global_posts.push(this.props.data[i])
		}

		this.trending_refs = []
		this.global_posts.map((item, i) => {
			var trending_ref = React.createRef();
			if (i == 0)
			{
				this.trending_posts.push(<div key = {item.post_id} ref = {trending_ref} dangerouslySetInnerHTML={this.renderiframe(item.embedded_content)} />)
			}
			else
			{
				this.trending_posts.push(<div key = {item.post_id} ref = {trending_ref}  style = {{display:'none'}} dangerouslySetInnerHTML={this.renderiframe(item.embedded_content)} />)
			}
			this.trending_refs.push(trending_ref)
		})
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		}
	}

	rightClick()
	{
		this.trending_refs[this.global_post_index].current.style.display = 'none'
		this.global_post_index++;
		if (this.global_post_index >= this.trending_refs.length)
		{
			this.global_post_index = 0;
		}
		this.trending_refs[this.global_post_index].current.style.display = ''
		this.forceUpdate();
	}

	leftClick()
	{
		this.trending_refs[this.global_post_index].current.style.display = 'none'
		this.global_post_index--;
		if (this.global_post_index < 0)
		{
			this.global_post_index = this.trending_refs.length - 1;
		}
		this.trending_refs[this.global_post_index].current.style.display = ''
		this.forceUpdate();
	}



	render()
	{

		//<img src = "/placeholder.jpg"  />
		return (
		<div style = {{width:'400px', height:'2000px', backgroundColor:'white', border:'1px solid #F1F1F1', borderRadius:'7px', position:'relative'}}>
			<div style = {{margin:'0px auto', fontWeight:'bold', width:'110px', fontSize:'27px', paddingTop:'16px'}}>
				Trending
			</div>
			<div style = {{margin:'0px auto', fontWeight:'bold', width:'324px', height:'10px', fontSize:'27px', paddingTop:'16px', borderBottom:'1px solid rgba(0, 0, 0, 0.09)'}}>

			</div>
			<div style = {{display:'flex', flexDirection:'row', paddingTop:'30px', width:'290px', margin:'0px auto'}}>
				<svg onClick = {this.leftClick.bind(this)} style = {{position:'relative', top:'140px', right:'20px'}} width="20" height="50" viewBox="0 0 20 50" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M19 49L2 25L19 0.999998" stroke="#2F3846" strokeOpacity="0.2" strokeWidth="2"/>
				</svg>
				{this.trending_posts}
				<svg onClick = {this.rightClick.bind(this)} style = {{position:'relative', top:'140px', left:'20px'}} width="20" height="50" viewBox="0 0 20 50" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M1 1L18 25L1 49" stroke="#2F3846" strokeOpacity="0.2" strokeWidth="2"/>
				</svg>
			</div>
		</div>
		)
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
		    	that.postsRef.current.addPosts(data.songs, data.likes, data.num_comments, data.num_posts, data.user_profiles)
		    	that.loading_posts_semaphor = false;
		 	})
		}
	}


	render()
	{
		return (
			<div style = {{display:'flex', flexDirection:'row', width:'1190px', margin:'0px auto'}}>
				<div className = "feed" style = {{position:'relative', top:'100px', border: '1px solid #F1F1F1', borderRadius:'7px', width:'755px', backgroundColor:'#F6F6F6'}}>
					<NewPostSubmission style = {{position:'relative', left:'10px'}} />
					<PostInfo style = {{position:'relative', top:'20px', left:'10px'}} ref = {this.postsRef} songs = {this.props.data.songs} likes = {this.props.data.likes} num_comments = {this.props.data.num_comments} user_profiles = {this.props.data.user_profiles}/>
				</div>
				<div style = {{position:'relative', top:'100px', left:'15px', border: '1px solid #F1F1F1', borderRadius:'7px', width:'420px', height:'2028px', backgroundColor:'#F6F6F6'}}>
					<div style = {{position:'relative', top:'14px', left:'10px'}}>
					<Trending data = {this.props.data.global_songs} />
					</div>
				</div>
			</div>
		);
	}

}