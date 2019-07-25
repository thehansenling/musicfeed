import React from 'react';
import StandardHeader from './standard_header.js'
import FollowerInfo from './followerinfo.js'
import utils from './utils.js'
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
			this.albums.push(
			<div key = {album.post_id} style = {{display: 'flex', flexDirection:'column', padding:'10px'}}>
				{album.album}
				<div dangerouslySetInnerHTML={this.renderiframe(utils.SetSpotifySize(album.embedded_content, 212, 292))}></div>
			</div>)

		}
	}

	componentDidMount() 
	{
		this.generateAlbums();
	}

	render()
	{

		return (
				<div style = {{maxWidth:'800px'}}>
					<h1> <a href= {"/artist/" + this.props.artist + "/albums"}> Top Albums </a> </h1> 
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
			this.songs.push(
			<div key = {song.post_id} style = {{display: 'flex', flexDirection:'column', padding:'10px'}}>
				{song.song}
				<div dangerouslySetInnerHTML={this.renderiframe(utils.SetSpotifySize(song.embedded_content, 212, 292))}></div>
			</div>)
		}
	}

	componentDidMount() 
	{
		this.generateSongs();
	}

	render()
	{
		
		return (
				<div style = {{maxWidth:'800px'}}>
					<h1> <a href= {"/artist/" + this.props.artist + "/songs"}> Top Songs </a> </h1> 
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
		return (
			<div>
				<img style = {{width:'260px', height:'260px'}} src = {this.state.picture}></img> 
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
												  "Follow State":this.following_state})
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
		return (
			<div style={{width:'735px', border: '1px solid #F1F1F1'}}>
				<div style = {{display:'flex', flexDirection:'row', height:'300px', paddingLeft:'20px', paddingTop:'20px'}}>
					<div style = {{width:'260px', height:'260px'}}>
						<ArtistPicture artist = {this.props.data.artist}/>
					</div>
					<div style = {{paddingLeft:'20px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'row', height:'260px'}}>
						<div style = {{fontWeight:'bold', fontSize:'40px'}}>
							{this.props.data.artist} 
							<div  style = {{fontWeight:'regular', fontSize:'20px'}}>
								{this.props.data.num_user_posts + " User Posts"}
							</div>
						</div>
						<div style = {{position:'relative', left:'32px', paddingTop:'10px'}}>
							<button onClick = {this.followClicked.bind(this)} style = {{height:'38px', width:'120px', fontSize:'18px'}}  className = "grayButton"> {this.button_text} </button>
							<div style = {{fontSize:'20px', paddingTop:'10px'}}>
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
				this.props.mixpanel
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
						this.props.mixpanel
					));
				}		
				that.setState({posts: that.state.posts.concat(newPosts)});
		    	that.loading_posts_semaphor = false;
		 	})
		}
	}

	render()
	{
		return (

			<div style={{margin:'0px auto', width:'735px', paddingTop:'50px'}}>
				<div style = {{backgroundColor:"#FFFFFF", borderRadius:'7px'}}>
					<ArtistPost data = {this.props.data} mixpanel = {this.props.mixpanel}/>
				</div>
				<div style = {{paddingTop:'20px'}} >
					<PostInfo posts = {this.state.posts}/>
				</div>
			</div>

		);
	}
}