import React from 'react';
import StandardHeader from './standard_header.js'
import { PostInfo, makePost } from './post.js'
import utils from './utils.js'
import tag_utils from './tag_utils.js'
import {isMobile} from 'react-device-detect';

class ContentSearchItem extends React.Component {
	constructor(props)
	{
		super(props)
	}

	handleClick()
	{
		this.props.song_callback(this.props.url, this.props.type);
	}

	render()
	{
		return (
		<div onClick = {this.handleClick.bind(this)}  className = "contentsearchlistitem" style = {{width:'1024px',height:'36px', position:'block', zIndex:'2', display:'flex', alignItems:'center'}}>	
			{this.props.artist + " - " + this.props.name}
		</div>
		)
	}
}

class NewPostSubmission extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			embedLink: '',
			title: '',
			content: '',
			searchItems:[],
		};
		this.contentRef = React.createRef();

		this.searchRef = React.createRef();

		this.content_search = ""

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
		this.submissionLikeState = -1
		this.modified = false;
	}

	setSong(song, type)
	{
		var spotify_url = '<iframe src="https://open.spotify.com/embed/track/'
		if (type == 'album')
		{
			spotify_url = '<iframe src="https://open.spotify.com/embed/album/'
		}
		let embedLink = spotify_url + song + '" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'
		this.setState({embedLink});
		this.closeContentSearchList()
	}

	songInput(event)
	{
		if (this.modified == false)
		{
			this.props.mixpanel.track("Song Entered", {'username':this.props.username})
		}
		this.modified = true

		var embedLink = event.target.value;
		if (embedLink.indexOf('<iframe src="https://open.spotify.com') == -1 &&
			embedLink.indexOf('https://open.spotify.com') != -1)
		{
			if (embedLink.indexOf('track') != -1)
			{
				embedLink = '<iframe src="' + embedLink.substring(0, embedLink.indexOf('/track')) + '/embed/track/' +  embedLink.substring(embedLink.indexOf('.com')+11, embedLink.indexOf('?')) + '" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'
			}
			else
			{
				embedLink = '<iframe src="' + embedLink.substring(0, embedLink.indexOf('/album')) + '/embed/album/' +  embedLink.substring(embedLink.indexOf('.com')+11, embedLink.indexOf('?')) + '" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'						
			}
		}
			
		this.setState({embedLink});

		var that = this;
		fetch("/spotify_search", {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Basic',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				text: embedLink
			}),
		}).then(function(response) {
			return response.json();
		}).then(function (data) {
			let searchItems = []
			for (var item of data.data)
			{
				searchItems.push(<ContentSearchItem artist = {item.artist} name = {item.name} type = {item.type} url = {item.url} song_callback = {that.setSong.bind(that)}/>)
			}
			that.setState({searchItems})
		});
	}

	onTitleChange(event) {
		let title = event.target.value;
		this.setState({title});
	}

	contentInput()
	{
		var input = event.target.value;
		var content_str = this.contentRef.current.value;
		//update and prune tags list
		tag_utils.getTags(this);
		this.lastContentSize = this.contentRef.current.value.length;
		this.forceUpdate();
	}

	selectTag(e)
	{
		tag_utils.tagClicked(this, e)
	}

	submitPost()
	{
		this.props.mixpanel.track("Post Submitted", {'username':this.props.username});
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		if (this.state.embedLink.indexOf('<iframe src="https://open.spotify.com') == -1)
		{
			alert("Invalid Embed Code")
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
			body: JSON.stringify({
				song: this.state.embedLink,
				content: this.contentRef.current.value,
				title: this.state.title,
				submissionLikeState: this.submissionLikeState,
				potentialTags: this.potential_tags
			}),
		}).then(function(response) {
			return response.json();
		}).then(function (data) {
			that.setState({embedLink: '', title: ''});
			that.contentRef.current.value = ""
			location.reload(true);
		});
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

	componentDidMount()
	{
		window.addEventListener('mousedown', this.handleClickOutside.bind(this));
	}

	componentWillUnmount()
	{
		window.removeEventListener('mousedown', this.handleClickOutside.bind(this));
	}
		

	handleClickOutside(event)
	{
		if (event.target.className.indexOf("contentsearchlistitem") == -1 && event.target.className.indexOf("contentsearchlist") == -1) {
			this.closeContentSearchList()
		}
		else
		{
		}
	}

	closeContentSearchList()
	{
		this.setState({searchItems:[]})
	}

	render()
	{
		var tag_display = 'none'

		if (this.tagFlag)
		{
			tag_display = ''
		}

		var create_post_size = '20px'
		var placeholder_size = '20px'
		var embed_code_text = '16px'
		var search_list_top_padding = '42px'
		if (isMobile)
		{
			create_post_size = '3.6em'
			placeholder_size = '2.6em'
			embed_code_text = '1.8em'
			search_list_top_padding = '60px'
		}

		var search_item_display = 'none'
		if (this.state.searchItems.length > 0)
		{
			search_item_display = ''
		}

		var create_post_color = '#178275'
		if (this.props.user_info != undefined)
		{
			create_post_color = this.props.user_info.profile_picture
		}

		return (
			<div
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
						fontSize: placeholder_size,
						color: 'rgba(47, 56, 70, 0.58)',
						borderBottom: '1px solid rgba(0, 0, 0, 0.09)',
						paddingBottom: '8px',
					}}
				>
					Create Post
				</div>
				<div style={{display:'flex', flexDirection:'row', paddingTop:'16px'}}>
					<div style={{width:'65px', height:'65px', backgroundColor:create_post_color, borderRadius:'50%', marginRight:'12px'}}></div>
					<div style={{display: 'flex', flex: '1 0 auto', flexDirection:'column'}}>
						<input
							onChange={this.songInput.bind(this)}
							value={this.state.embedLink}
							placeholder="Search For Spotify Link"
							style={{
								border:'1px solid rgba(0, 0, 0, 0.09)',
								borderRadius: '8px',
								fontSize:embed_code_text,
								padding:'8px',
								width: '100%',
								zIndex:'2'
							}}/>
						<div className = "contentsearchlist" style = {{position:'absolute', zIndex:'1', maxHeight:'500px', overflowY:'scroll', paddingTop:search_list_top_padding, borderBottom:'1px solid rgba(0, 0, 0, 0.09)', display:search_item_display, borderRadius:'7px', backgroundColor:'white'}}>
							{this.state.searchItems}
						</div>
					</div>
				</div>
				<div style={{display: this.state.embedLink ? 'flex' : 'none', flexDirection: 'row', paddingTop: '16px'}}>
					<div style={{display: 'flex', flexDirection: 'column', flex: '1 0 auto'}}>
						<div style={{display:'flex', flexDirection:'column', flex: '1 0 auto'}}>
							<input
								autoComplete="off"
								onChange={this.onTitleChange.bind(this)}
								placeholder="Title"
								style={{
									border:'1px solid rgba(0, 0, 0, 0.09)',
									borderBottom:'none',
									borderRadius:'8px 8px 0 0',
									padding: '8px',
								}}
								type="text"
								value={this.state.title}
							/>
							<textarea
								autoComplete="off"
								onChange={this.contentInput.bind(this)}
								placeholder="Your text here"
								ref={this.contentRef}
								style={{
									border:'1px solid rgba(0, 0, 0, 0.09)',
									borderRadius:'0 0 8px 8px',
									flex: '1 0 auto',
									padding: '8px',
									resize: 'none',
								}}
							/>
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

					<div style={{display: this.state.embedLink ? '' : 'none', marginLeft: '16px'}}>
						<div dangerouslySetInnerHTML={utils.renderiframe(this.state.embedLink)} />
					</div>
				<div style = {{position:'fixed', width: '200px', height:'300px', right:'1%', top:'60px', backgroundColor:'white', display:tag_display, zIndex:15, overflowY:'scroll', border:'1px solid #F1F1F1', borderRadius:'7px'}} >
					{this.tagList}
				</div>
				</div>
			</div>
		);
	}
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

			this.props.data[i].embedded_content = utils.SetSpotifySize(iframe_string, 250, 330)


			this.global_posts.push(this.props.data[i])
		}
		this.related_links = []

		this.trending_refs = []
		this.global_posts.map((item, i) => {
			var trending_ref = React.createRef();
			if (i == 0)
			{
				this.trending_posts.push(<div key = {item.post_id} ref = {trending_ref} dangerouslySetInnerHTML={utils.renderiframe(item.embedded_content)} />)
			}
			else
			{
				this.trending_posts.push(<div key = {item.post_id} ref = {trending_ref}  style = {{display:'none'}} dangerouslySetInnerHTML={utils.renderiframe(item.embedded_content)} />)
			}
			this.trending_refs.push(trending_ref)
		})
	}

	rightClick()
	{
		this.props.mixpanel.track("Trending Right Click", {'username':this.props.username})
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
					item.embedded_content = utils.SetSpotifySize(item.embedded_content, 250, 330)
					var trending_ref1 = React.createRef()
					that.trending_posts.push(<div key = {item.post_id} ref = {trending_ref1} style = {{display:'none'}} dangerouslySetInnerHTML={utils.renderiframe(item.embedded_content)} />);
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
		this.props.mixpanel.track("Trending Left Click", {'username':this.props.username})
		this.trending_refs[this.global_post_index].current.style.display = 'none'
		this.global_post_index--;
		if (this.global_post_index < 0)
		{
			this.global_post_index = 0;

		}
		this.trending_refs[this.global_post_index].current.style.display = ''
		this.forceUpdate();
	}

	onRelatedLinkClicked(item)
	{
		this.props.mixpanel.track("Other Link Clicked", {"link":item.text, 'username':this.props.username})
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
		    		that.related_links.push(<div style = {{width:'300px', height:'20px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}><a onClick={that.onRelatedLinkClicked.bind(that, item)} href = {item.url}> {item.text} </a> </div>)
		    	}
		    that.forceUpdate()
	    })
	}

	render()
	{

		//<img src = "/placeholder.jpg" />
		return (
		<div style = {{width:'400px', paddingBottom:'20px', backgroundColor:'white', border:'1px solid #F1F1F1', borderRadius:'8px'}}>
			<div style = {{margin:'0px auto', fontWeight:'bold', width:'110px', fontSize:'27px', paddingTop:'16px'}}>
				Trending
			</div>
			<div style = {{margin:'0px auto', fontWeight:'bold', width:'324px', height:'10px', fontSize:'27px', paddingTop:'16px', borderBottom:'1px solid rgba(0, 0, 0, 0.09)'}}>

			</div>
			<div style = {{display:'flex', flexDirection:'row', paddingTop:'30px', width:'290px', margin:'0px auto', justifyContent:'center', alignItems:'center'}}>
				
				<div style = {{paddingRight:'10px', width:'30px', height:'50px'}}>
					<svg onClick = {this.leftClick.bind(this)} width="20" height="50" viewBox="0 0 20 50" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M19 49L2 25L19 0.999998" stroke="#2F3846" strokeOpacity="0.2" strokeWidth="2"/>
					</svg>
				</div>
				{this.trending_posts.map((child) => {return child})}
				<div style = {{paddingLeft:'10px', width:'20px', height:'50px'}}>
					<svg onClick = {this.rightClick.bind(this)} width="20" height="50" viewBox="0 0 20 50" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M1 1L18 25L1 49" stroke="#2F3846" strokeOpacity="0.2" strokeWidth="2"/>
					</svg>
				</div>
			</div>
			<div style = {{paddingTop:'10px', margin: '0px auto', width:'300px'}}>
				<div style = {{margin:'0px auto', fontWeight:'bold', width:'260px', fontSize:'27px', paddingTop:'16px'}}>
					Listening Club Album
				</div>
				<div style = {{paddingTop:'12px'}}>
					<a style = {{display:'flex', justifyContent:'center'}} href = "/user/unheard/351ccb6c-f459-3ff6-a7e3-785ee36883c4"> Taylor Swift - 1989</a>
				</div>
			</div>
			<div style = {{paddingTop:'0px', margin: '0px auto', width:'300px'}}>
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

export default class Feed extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = { posts: [] };
		this.loading_posts_semaphor = false;
		this.offset = 0;
		this.non_priority_offset = 0;
		this.global_offset = 0;
		this.non_priority_global_offset = 0;
		
	}

	handleScroll() {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_posts_semaphor) 
		{
			var that = this
			this.loading_posts_semaphor = true
		    fetch("/load_post_data", {
		        method: "POST",
		        headers: {
		        	'Accept': 'application/json',
		        	'Authorization': 'Basic',
		        	'Content-Type': 'application/json',
		        },
		        body: JSON.stringify({offset:that.offset,
		        					  user: that.props.data.username})})
		    .then(function(response) { return response.json();})
		    .then(function (data) { 
		    	that.offset += data.songs.length;
		    	//that.postsRef.current.addPosts(data.songs, data.likes, data.num_comments, data.num_posts, data.user_profiles)
				let newPosts = [];
				for (var song of data.songs) {
					newPosts.push(makePost(
						song,
						data.likes,
						data.num_comments,
						data.num_posts,
						data.bumps,
						data.user_profiles,
						this.props.mixpanel,
						this.props.data.username
					));
				}		    	
				that.setState({posts: that.state.posts.concat(newPosts)});
		    	that.loading_posts_semaphor = false;
		 	})
		}
	}

	componentDidMount()
	{
		this.props.mixpanel.track("Feed Page", {"username":this.props.data.username})
	    window.addEventListener('scroll', this.handleScroll.bind(this));
	    this.updateOffsets(this.props.data.songs)
			let startingPosts = [];
			for (var song of this.props.data.songs) {
				startingPosts.push(makePost(
					song,
					this.props.data.likes,
					this.props.data.num_comments,
					this.props.data.num_posts,
					this.props.data.bumps,
					this.props.data.user_profiles,
					this.props.mixpanel,
					this.props.data.username
				));
			}
			this.setState({posts: startingPosts});
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
			var that = this;

			this.loading_posts_semaphor = true;
			fetch("/load_feed", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Authorization': 'Basic',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					offset:this.offset,
					non_priority_offset: this.non_priority_offset,
					global_offset: this.global_offset,
					non_priority_global_offset: this.non_priority_global_offset,
				}),
			}).then(function(response) {
				return response.json();
			}).then(function (data) {
				that.updateOffsets(data.songs)
				let newPosts = [];
				for (var song of data.songs) {
					newPosts.push(makePost(
						song,
						data.likes,
						data.num_comments,
						data.num_posts,
						data.bumps,
						data.user_profiles,
						that.props.mixpanel
					));
				}
				that.setState({posts: that.state.posts.concat(newPosts)});
				that.loading_posts_semaphor = false;
			});
		}
	}

	render()
	{
		var trending_style = ''
		var posts_width = ''
		var top_padding = ''
		if (isMobile)
		{
			top_padding = '12%'
			trending_style = 'none'
			posts_width = '100%'
		}
		return (
			<div style={{display:'flex', justifyContent: 'center', backgroundColor:'#F6F6F6', paddingTop:top_padding}}>
				<div style={{display:'flex', flexDirection:'column', width:posts_width}}>
					<div style={{marginTop: '16px'}}>
						<NewPostSubmission user_info = {this.props.data.user_info} mixpanel = {this.props.mixpanel} username = {this.props.data.username}/>
					</div>
					<div style={{display:'flex', flexDirection:'row', marginTop: '12px'}}>
						<div style={{width:'100%'}}>
							<PostInfo posts={this.state.posts} />
						</div>
						<div style = {{display:trending_style}} className={'feed_stickySideBar'}>
							<Trending data = {this.props.data.global_songs} mixpanel = {this.props.mixpanel} username = {this.props.data.username}/>
						</div>
					</div>
				</div>
			</div>
		);
	}

}
