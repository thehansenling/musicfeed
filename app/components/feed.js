import React from 'react';
import StandardHeader from './standard_header.js'
import PostInfo from './post.js'
import utils from './utils.js'
import tag_utils from './tag_utils.js'

class NewPostSubmission extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {embedLink: ''}

		this.embedded_content = "";

		this.contentRef = React.createRef();
		this.titleRef = React.createRef();

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
		this.show_song_display = 'none'
		this.submissionLikeState = -1
		this.shouldNotShowContentBox = true
	}

	songInput(event)
	{
		var embedLink = event.target.value;
		this.setState({embedLink});
		if (embedLink) {
			// show song display
			// show content input box

			this.shouldNotShowContentBox = false;
			this.embedded_content = embedLink;
			this.show_song_display = ''
			this.forceUpdate();
		} else {
			// hide song display
			// hide content input box

			this.shouldNotShowContentBox = true;
			this.embedded_content = embedLink;
			this.show_song_display = 'none'
			this.forceUpdate();
		}

	}

	contentInput()
	{
		var input = event.target.value;
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
			body: JSON.stringify({song: this.state.embedLink,
								  content: this.contentRef.current.value,
								  title: this.titleRef.current.value,
								  submissionLikeState: this.submissionLikeState,
								  potentialTags: this.potential_tags}
								  )})
			.then(function(response) { return response.json();})
			.then(function (data) {

			this.setState({embedLink: ''});
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

	submissionLiked()
	{
		if (this.submissionLikeState == 1)
		{
			this.submissionLikeState = -1

		}
		else
		{
			this.submissionLikeState = 1
		}
		this.forceUpdate()
	}

	submissionDisliked()
	{
		if (this.submissionLikeState == 0)
		{
			this.submissionLikeState = -1
		}
		else
		{
			this.submissionLikeState = 0
		}
		this.forceUpdate()
	}

	render()
	{
		var tag_display = 'none'
		if (this.tagFlag)
		{
			tag_display = ''
		}

		return (
			<div
				ref={this.containerRef}
				style={{
					display:'flex',
					flexDirection: 'column',
					backgroundColor:'white',
					border: '1px solid #F1F1F1',
					borderRadius:'8px',
					padding: '12px 16px 16px 16px',
				}}
			>
				<div
					style={{
						fontFamily: 'RobotoRegular',
						fontSize: '20px',
						color: 'rgba(47, 56, 70, 0.58)',
						borderBottom: '1px solid rgba(0, 0, 0, 0.09)',
						paddingBottom: '8px',
					}}
				>
					Create Post
				</div>
				<div style={{display:'flex', flexDirection:'row', paddingTop:'16px'}}>
					<div style={{width:'65px', height:'65px', backgroundColor:'#178275', borderRadius:'50%', marginRight:'12px'}}></div>
					<div style={{display: 'flex', flex: '1 0 auto'}}>
						<input
							onChange={this.songInput.bind(this)}
							value={this.state.embedLink}
							placeholder="Embed link here"
							style={{
								border:'1px solid rgba(0, 0, 0, 0.09)',
								borderRadius: '8px',
								fontSize:'16px',
								padding:'8px',
								width: '100%',
							}}
						/>
					</div>
				</div>
				<div style={{display: this.shouldNotShowContentBox ? 'none' : 'flex', flexDirection:'row', paddingTop: '16px'}}>
					<div
						ref={this.postContentRef}
						id="post"
						style={{display: 'flex', flexDirection: 'column', flex: '1 0 auto'}}
						autoComplete="off"
					>
						<div style={{display:'flex', flexDirection:'column', flex: '1 0 auto'}}>
							<input ref={this.titleRef} id="title" type="text" name="title" placeholder="Title" style={{border:'1px solid rgba(0, 0, 0, 0.09)', borderBottom:'none', borderRadius:'8px 8px 0 0', padding: '8px'}}/>
							<textarea
								onChange={this.contentInput.bind(this)}
								ref={this.contentRef}
								id="content"
								name="content"
								placeholder="Your text here"
								style={{border:'1px solid rgba(0, 0, 0, 0.09)', borderRadius:'0 0 8px 8px', flex: '1 0 auto', padding: '8px', resize: 'none'}}
							></textarea>
						</div>
						<div style={{paddingTop: '12px'}}>
							<button
								className={'feed_postButton'}
								onClick={this.submitPost.bind(this)}
							>
								Post
							</button>
						</div>
					</div>

					<div style = {{display:this.show_song_display, marginLeft: '16px'}}>
						<div id="showsong"  dangerouslySetInnerHTML={this.renderiframe(this.embedded_content)} />
					</div>
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
		this.related_links = []

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
		if (this.global_post_index >= 15)
		{
			this.global_post_index = 0;
			this.trending_refs[this.global_post_index].current.style.display = ''
		}
		else if (this.global_post_index >= this.trending_refs.length - 2)
		{
			var new_offset = this.trending_refs.length;
			var that = this;
			fetch("/updateTrending",
			{
			method: "POST",
			headers:
			{
				'Accept': 'application/json',
				'Authorization': 'Basic',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({global_offset: new_offset})
			})
			.then(function(response) { return response.json();})
			.then(function (data)
			{
				for (var key in Object.keys(data.posts))
				{
					var item = data.posts[key]
					item.embedded_content = SetSpotifySize(item.embedded_content, 250, 330)
					var trending_ref1 = React.createRef()
					that.trending_posts.push(<div key = {item.post_id} ref = {trending_ref1} style = {{display:'none'}} dangerouslySetInnerHTML={that.renderiframe(item.embedded_content)} />);
					that.trending_refs.push(trending_ref1)
					that.forceUpdate()
				}
				that.trending_refs[that.global_post_index].current.style.display = ''
			})
		}
		else
		{
			this.trending_refs[this.global_post_index].current.style.display = ''
		}
		this.forceUpdate();
	}

	leftClick()
	{
		this.trending_refs[this.global_post_index].current.style.display = 'none'
		this.global_post_index--;
		if (this.global_post_index < 0)
		{
			this.global_post_index = 0;

		}
		this.trending_refs[this.global_post_index].current.style.display = ''
		this.forceUpdate();
	}

	componentDidMount()
	{
		var that = this
	    fetch('/random_links', {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        	},
		    body: JSON.stringify({})})
		    .then(function(response) { return response.json();})
		    .then(function (data) {
		    	for (var item of data.data)
		    	{
		    		that.related_links.push(<div style = {{width:'300px', height:'20px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}><a href = {item.url}> {item.text} </a> </div>)
		    	}
		    that.forceUpdate()
	    })
	}

	render()
	{

		//<img src = "/placeholder.jpg" />
		return (
		<div style = {{width:'400px', height:'680px', backgroundColor:'white', border:'1px solid #F1F1F1', borderRadius:'8px'}}>
			<div style = {{margin:'0px auto', fontWeight:'bold', width:'110px', fontSize:'27px', paddingTop:'16px'}}>
				Trending
			</div>
			<div style = {{margin:'0px auto', fontWeight:'bold', width:'324px', height:'10px', fontSize:'27px', paddingTop:'16px', borderBottom:'1px solid rgba(0, 0, 0, 0.09)'}}>

			</div>
			<div style = {{display:'flex', flexDirection:'row', paddingTop:'30px', width:'290px', margin:'0px auto'}}>
				<svg onClick = {this.leftClick.bind(this)} width="20" height="50" viewBox="0 0 20 50" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M19 49L2 25L19 0.999998" stroke="#2F3846" strokeOpacity="0.2" strokeWidth="2"/>
				</svg>
				{this.trending_posts.map((child) => {return child})}
				<svg onClick = {this.rightClick.bind(this)} width="20" height="50" viewBox="0 0 20 50" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M1 1L18 25L1 49" stroke="#2F3846" strokeOpacity="0.2" strokeWidth="2"/>
				</svg>
			</div>
			<div style = {{paddingTop:'10px', margin: '0px auto', width:'300px'}}>
				<div style = {{margin:'0px auto', fontWeight:'bold', width:'140', fontSize:'27px', paddingTop:'16px'}}>
					Other Links
				</div>
				<div style = {{margin:'0px auto', fontWeight:'bold', width:'300px', height:'10px', fontSize:'27px', paddingTop:'16px', borderBottom:'1px solid rgba(0, 0, 0, 0.09)'}}></div>
				<div style = {{paddingTop:'20px'}}>
					{this.related_links.map((child) => {return child})}
				</div>
			</div>
		</div>
		)
	}

}
//

export default class Feed extends React.Component {
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
			<div style={{display:'flex', justifyContent: 'center', backgroundColor:'#F6F6F6'}}>
				<div style={{display:'flex', flexDirection:'column'}}>
					<div style={{marginTop: '16px'}}>
						<NewPostSubmission />
					</div>
					<div style={{display:'flex', flexDirection:'row', marginTop: '12px'}}>
						<div style={{marginRight: '12px'}}>
							<PostInfo ref={this.postsRef} songs = {this.props.data.songs} likes = {this.props.data.likes} num_comments = {this.props.data.num_comments} user_profiles = {this.props.data.user_profiles} bumps = {this.props.data.bumps}/>
						</div>
						<div style={{position: 'sticky', top: '72px', height: '100%'}}>
							<Trending data = {this.props.data.global_songs} />
						</div>
					</div>
				</div>
			</div>
		);
	}

}
