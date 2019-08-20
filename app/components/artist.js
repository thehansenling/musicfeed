import React from 'react';
import StandardHeader from './standard_header.js'
import FollowerInfo from './followerinfo.js'
import utils from './utils.js'
import {isMobile} from 'react-device-detect';
import { PostInfo, makePost } from './post.js'
// class FollowingInfo extends React.Component
// {
// 	constructor(props)
// 	{
// 		super(props)
// 	}

// 	render()
// 	{
// 		return (
// 			<div>
// 				x 
// 				<button className = 'follow_button' id = "follow_button" type="button">Follow</button>
// 				<div className ="follow_icon">
// 					Not Following
// 				</div>
// 			</div>			
// 		);
// 	}
// }

class AlbumDisplay extends React.Component
{
	constructor(props)
	{
		super(props)
		this.albums = [];
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}

	generateAlbums()
	{
		var album_count = 0;
		for (var album of this.props.data) 
		{
			++album_count;
			if (album_count > 3)
			{
				break;
			}

			var embedded_content = utils.SetSpotifySize(album.embedded_content, 300, 380)
			var name_size = '1em'
			var content_width = '300px'
			var spacer_size = '1%'
			if (isMobile)
			{
				embedded_content = utils.SetSpotifySize(album.embedded_content, 300, 380)
				name_size = '2em'
				content_width = '300px'
				spacer_size = '6%'
			}


			this.albums.push(
			<div key = {album.post_id} style = {{display: 'flex', flexDirection:'column', fontSize:name_size, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipses', width:content_width}}>
				{album.album}
				<div dangerouslySetInnerHTML={this.renderiframe(embedded_content)}></div>
			</div>)
			this.albums.push(<div style = {{width:spacer_size}}></div>)

		}
		if (this.albums.length > 0)
		{
			this.albums.pop();
		}
	}

	componentDidMount() 
	{
		this.generateAlbums();
	}

	render()
	{
		var top_size = '2em'
		if (isMobile)
		{
			top_size = '3.6em'
		}
		return (
				<div style = {{}}>
					<div style = {{fontSize:top_size}}> <a href= {"/artist/" + this.props.artist + "/albums"}> Top Albums </a> </div> 
					<div className = "album_display" style = {{display: 'flex',flexDirection:'row'}} >
						{this.albums}
					</div>
				</div>
			
		);
	}
}

class SongDisplay extends React.Component
{
	constructor(props)
	{
		super(props)
		this.songs = [];
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}

	generateSongs()
	{

		var song_count = this.songs.length;
		for (var song of this.props.data) 
		{
			++song_count;
			if (song_count > 3)
			{
				break;
			}
			var embedded_content = utils.SetSpotifySize(song.embedded_content, 300, 380)
			var name_size = '1em'
			var content_width = '300px'
			var spacer_size = '1%'
			if (isMobile)
			{
				embedded_content = utils.SetSpotifySize(song.embedded_content, 300, 380)
				name_size = '2em'
				content_width = '300px'
				spacer_size = '6%'
			}

			this.songs.push(
			<div key = {song.post_id} style = {{display: 'flex', flexDirection:'column', fontSize:name_size, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipses', width:content_width}}>
				{song.song}
				<div  dangerouslySetInnerHTML={this.renderiframe(embedded_content)}></div>
			</div>)
			this.songs.push(<div style = {{width:spacer_size}}></div>)

		}
		if (this.songs.length > 0)
		{
			this.songs.pop();
		}
	}

	componentDidMount() 
	{
		this.generateSongs();
	}

	render()
	{
		var top_size = '2em'
		if (isMobile)
		{
			top_size = '3.6em'
		}		
		return (
				<div style = {{}}>
					<div style = {{fontSize:top_size}}> <a href= {"/artist/" + this.props.artist + "/songs"}> Top Songs </a> </div> 
					<div className = "song_display" style = {{display: 'flex',flexDirection:'row'}} >
						{this.songs}
					</div>
				</div>
			
		);
	}
}

class ArtistPicture extends React.Component
{
	constructor(props)
	{
		super(props)
		this.state = {picture:undefined}
	}

	componentDidMount() 
	{
		var that = this
	    fetch("/artist_picture", {
	        method: "POST",
	        headers: {
	        	'Accept': 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({artist:that.props.artist,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) { 
	    	that.setState({picture:data.picture})
	 	})		
	}

	render()
	{
		var size = '260px'
		if (isMobile)
		{
			size = '500px'
		}
		return (
			<div>
				<img style = {{width:size, height:size}} src = {this.state.picture}></img> 
			</div>
		)
	}
}

class ArtistPost extends React.Component
{
	constructor(props)
	{
		super(props);
		this.button_text = "Follow"
		for (var follow of props.data.follows)
		{
			if (follow.user_id == props.data.username)
			{
				this.button_text = "Unfollow"
				this.following_ui = "Following"
				this.following_state = true;
				break;
			}
		}		
	}

	followClicked()
	{
		this.props.mixpanel.track("Follow Artist", {"Artist":this.props.data.artist,
												  "Follow State":this.following_state,
													"username":this.props.username})
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		var that = this;
		if (this.following_state)
		{
			this.following_ui = "Not Following"
			this.button_text = "Follow"
			this.following_state = false
			this.follows_num -= 1
		}
		else
		{
			this.following_ui = "Following"
			this.button_text = "Unfollow"
			this.following_state = true;
			this.follows_num += 1
		}
		var followee;
		followee = that.props.data.artist

	    fetch("/follow", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({followee_id: followee, type:1,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	
	 	})	
	 	this.forceUpdate();
	}

	render()
	{

		var artist_size = '40px'
		var follow_size = '18pt'
		var followers_size = '20pt'
		var user_posts_size = '20pt'
		if (isMobile)
		{
			artist_size = '4em'
			follow_size = '2.4em'
			followers_size = '2.4em'
			user_posts_size = '.8em'
		}

		return (
			<div style={{margin:'0px auto'}}>
				<div style = {{display:'flex', flexDirection:'row', paddingLeft:'20px', paddingTop:'20px'}}>
					<div style = {{}}>
						<ArtistPicture artist = {this.props.data.artist}/>
					</div>
					<div style = {{paddingLeft:'20px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'row', height:'260px'}}>
						<div style = {{fontWeight:'bold', fontSize:artist_size}}>
							{this.props.data.artist} 
							<div  style = {{fontWeight:'regular', fontSize:user_posts_size}}>
								{this.props.data.num_user_posts + " User Posts"}
							</div>
						</div>
						<div style = {{position:'relative', left:'32px', paddingTop:'10px'}}>
							<button onClick = {this.followClicked.bind(this)} style = {{minHeight:'38px', minWidth:'120px', fontSize:follow_size}}  className = "grayButton"> {this.button_text} </button>
							<div style = {{fontSize:followers_size, paddingTop:'10px'}}>
								{this.props.data.follows.length + " Followers"}
							</div>
						</div>
					</div>

				</div>
				<div style = {{paddingLeft:'20px'}}>
					<AlbumDisplay data = {this.props.data.album_data} artist = {this.props.data.artist}/>
					<SongDisplay data = {this.props.data.song_data} artist = {this.props.data.artist}/>
				</div>
			</div>
		);
	}
}

export default class ArtistPage extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state = { posts: [] };
		this.offset = this.props.data.songs.length;
	}

	componentDidMount() 
	{
		window.addEventListener('scroll', this.handleScroll.bind(this));
		this.props.mixpanel.track("Artist Page", {"Artist":this.props.data.artist})
		let startingPosts = [];
		for (var song of this.props.data.songs) {
			startingPosts.push(makePost(
				song,
				this.props.data.likes,
				this.props.data.num_comments,
				[],
				[],
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

	handleScroll() {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_posts_semaphor) 
		{

			var that = this
			this.loading_posts_semaphor = true
		    fetch("/load_artist_post_data", {
		        method: "POST",
		        headers: {
		        	'Accept': 'application/json',
		        	'Authorization': 'Basic',
		        	'Content-Type': 'application/json',
		        },
		        body: JSON.stringify({offset:that.offset,
		        					  artist: that.props.data.artist})})
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
						that.props.mixpanel,
						that.props.data.username
					));
				}		
				that.setState({posts: that.state.posts.concat(newPosts)});
		    	that.loading_posts_semaphor = false;
		 	})
		}
	}

	render()
	{
		var total_width = '1000px'
		var top_padding = '50px'
		var post_info_width = '735px'
		if (isMobile)
		{
			total_width = '100%'
			top_padding = '12%'
			var post_info_width = ''
		}

		return (

			<div style={{margin:'0px auto', width:total_width, paddingTop:top_padding}}>
				<div style = {{backgroundColor:"#FFFFFF", borderRadius:'7px', display:'flex', paddingBottom:'20px'}}>
					<ArtistPost data = {this.props.data} mixpanel = {this.props.mixpanel} username = {this.props.data.username}/>
				</div>
				<div style = {{paddingTop:'20px', width:post_info_width, margin:'0px auto'}} >
					<PostInfo posts = {this.state.posts}/>
				</div>
			</div>

		);
	}
}