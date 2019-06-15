import React from 'react';
import StandardHeader from './standard_header.js'
import PostInfo from './post.js'
import FollowerInfo from './followerinfo.js'

class UserInfo extends React.Component {

	constructor(props) {
		super(props);
		this.description = props.user.description;
		this.description_ui = undefined
		if (this.props.username == this.props.user.username)
		{
			this.description_ui = <button onClick={this.editDescription.bind(this)}> Edit Description </button>;
		}
		this.description_text = React.createRef();
		this.bumps_ui = <div> Bumps: {this.props.user.bumps} </div>


	}

    submitDescription()
    {
		var that = this;
	    fetch("/submit_description", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({text: that.description_text.current.value, user:that.props.user.username})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	that.description = that.description_text.current.value;
			that.description_ui = <button onClick={that.editDescription.bind(that)}> Edit Description </button>
		 	that.forceUpdate();
	 	})	

	}

	editDescription()
	{
		this.description_ui = <div>
		<textarea ref = {this.description_text} style={{width:'80%',height:'50px',zIndex:'100'}}></textarea>
		<button onClick = {this.submitDescription.bind(this)} style= {{height:'30px', bottom:'30px', position:'relative'}} type='button'>submit</button>
		<button onClick = {this.closeDescription.bind(this)} style= {{bottom:'0px', position:'relative', height:'30px'}} type='button'>x</button>
		</div>
		this.forceUpdate();
	}

	closeDescription()
	{
		this.description_ui = <button onClick={this.editDescription.bind(this)}> Edit Description </button>
		this.forceUpdate();
	}

	render ()
	{
		return(
			<div className = "user_info" style={{margin: '0 auto', paddingTop:'10px', paddingLeft: '10px', paddingBottom:'10px', background:'white', border:'gray solid 1px', borderRadius:'4px', position:'relative', top:'100px', position:'relative', maxWidth:'980px'}}>
				<div style = {{fontSize:'30pt'}}>{this.props.user.username}</div>
				<div style = {{fontSize:'18pt'}}>{this.description}</div>
				{this.description_ui}
				<div style = {{fontSize:'18pt'}}>Score: {this.props.user.upvotes - this.props.user.downvotes}</div>
				{this.bumps_ui} 
			</div>
		);
	}
}

class ProfilePicture extends React.Component {
	constructor(props) {
		super(props);
		var colors = ['#178275', '#26408d', '#50b520', '#a5c823', '#46268f', '#d1aa25', '#af1f63', '#d19225', '#d12525']
		this.colors = []
		for (var i = 0; i < colors.length; ++i)
		{
			this.colors.push(<div key = {colors[i]} onClick = {this.setColor.bind(this)} style = {{backgroundColor:colors[i], width:'106px', height:'50px'}}>  </div>)
		}
		this.colorsRef = React.createRef()
	}	

	showColors()
	{
		if (this.colorsRef.current.style.display == 'none')
		{
			this.colorsRef.current.style.display = 'flex'
		}
		else
		{
			this.colorsRef.current.style.display = 'none'
		}
	}

	setColor(e)
	{
		this.colorsRef.current.style.display = 'none'
		this.props.user.profile_picture = e.target.style.backgroundColor
		var that = this;
	    fetch("/set_color", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({color:e.target.style.backgroundColor,
	        					  username:that.props.user.username})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	

	 	})			
	 	this.forceUpdate()
	}

	render()
	{
		return (<div style = {{position:'relative', paddingLeft:'10px', margin:'0px auto', width:'980px', height:'20px'}}>
					<div style = {{display:'flex', flexDirection:'row'}}>
						<div onClick = {this.showColors.bind(this)}> Select Profile Color </div> 
						<div style = {{width:'50px', height:'15px', backgroundColor: this.props.user.profile_picture, left:'10px', top:'3px', position:'relative'}}></div>
					</div>
					<div ref = {this.colorsRef} style = {{display:'none', flexDirection:'row'}}>
						{this.colors}
					</div>
				</div>
		)
	}
}

class FavoriteSongs extends React.Component {
	constructor(props) {
		super(props);


		this.selectSongRefs = []
		this.selectSongRefs.push(React.createRef());
		this.selectSongRefs.push(React.createRef());
		this.selectSongRefs.push(React.createRef());

		this.songRefs = []
		this.songRefs.push(React.createRef());
		this.songRefs.push(React.createRef());
		this.songRefs.push(React.createRef());

		this.selectArtistRefs = []
		this.selectArtistRefs.push(React.createRef());
		this.selectArtistRefs.push(React.createRef());
		this.selectArtistRefs.push(React.createRef());

		this.artistRefs = []
		this.artistRefs.push(React.createRef());
		this.artistRefs.push(React.createRef());
		this.artistRefs.push(React.createRef());
	}
	
	selectSongClicked(e)
	{
		if (this.selectSongRefs[parseInt(e.target.id)].current.style.display == 'none')
		{	
			this.selectSongRefs[parseInt(e.target.id)].current.style.display  = ''
		}
		else
		{
			this.selectSongRefs[parseInt(e.target.id)].current.style.display  = 'none'
		}
	}

	selectArtistClicked(e)
	{
		if (this.selectArtistRefs[parseInt(e.target.id)].current.style.display == 'none')
		{	
			this.selectArtistRefs[parseInt(e.target.id)].current.style.display  = ''
		}
		else
		{
			this.selectArtistRefs[parseInt(e.target.id)].current.style.display  = 'none'
		}
	}

	submitSongClicked(e)
	{
		if (parseInt(e.target.id) == 0)
		{
			this.props.user.song0 = this.selectSongRefs[parseInt(e.target.id)].current.children[0].value
		}
		else if (parseInt(e.target.id) == 1)
		{
			this.props.user.song1 = this.selectSongRefs[parseInt(e.target.id)].current.children[0].value
		}
		else if (parseInt(e.target.id) == 2)
		{
			this.props.user.song2 = this.selectSongRefs[parseInt(e.target.id)].current.children[0].value
		}

	    fetch("/favorite_song", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({number:parseInt(e.target.id),
	        					  song: this.selectSongRefs[parseInt(e.target.id)].current.children[0].value,
	        					  username: this.props.user.username,
	        					  })})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	

	 	})		
	 	this.forceUpdate();
	}


	submitArtistClicked(e)
	{
		if (parseInt(e.target.id) == 0)
		{
			this.props.user.artist0 = this.selectArtistRefs[parseInt(e.target.id)].current.children[0].value
		}
		else if (parseInt(e.target.id) == 1)
		{
			this.props.user.artist1 = this.selectArtistRefs[parseInt(e.target.id)].current.children[0].value
		}
		else if (parseInt(e.target.id) == 2)
		{
			this.props.user.artist2 = this.selectArtistRefs[parseInt(e.target.id)].current.children[0].value
		}

	    fetch("/favorite_artist", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({number:parseInt(e.target.id),
	        					  artist: this.selectArtistRefs[parseInt(e.target.id)].current.children[0].value,
	        					  username: this.props.user.username,
	        					  })})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	

	 	})		
	 	this.forceUpdate();
	}

	closeSongClicked(e)
	{
		this.selectSongRefs[parseInt(e.target.id)].current.style.display  = 'none'
	}

	closeArtistClicked(e)
	{
		this.selectArtistRefs[parseInt(e.target.id)].current.style.display  = 'none'
	}

	render()
	{
		var user_display = ''
		if (this.props.username != this.props.user.username)
		{
			user_display = 'none'
		}
		return (<div style = {{display: 'flex',flexDirection: 'row', position:'relative', paddingLeft:'10px', margin:'0px auto', width:'980px', height:'20px'}}>
					<div style = {{width:'490px'}}>
						<h1>Top 3 Songs</h1>
						<div ref = {this.songRefs[0]}>
							{this.props.user.song0}
						</div>
						<div ref = {this.songRefs[1]}>
							{this.props.user.song1}
						</div>
						<div ref = {this.songRefs[2]}>
							{this.props.user.song2}
						</div>						
						<div style = {{display:user_display}}>
							<div>
								<div>
								<button id = '0' onClick = {this.selectSongClicked.bind(this)}> Select Song 1 </button>
								
								</div>
								<div ref = {this.selectSongRefs[0]} style = {{display:'none'}}>
									<input />
									<button id = '0' onClick = {this.submitSongClicked.bind(this)} > Submit </button>
									<button id = '0' onClick = {this.closeSongClicked.bind(this)} > Close </button>
								</div>
							</div>
							<div>
								<button id = '1' onClick = {this.selectSongClicked.bind(this)}> Select Song 2 </button>
								<div ref = {this.selectSongRefs[1]} style = {{display:'none'}}>
									<input />
									<button id = '1' onClick = {this.submitSongClicked.bind(this)} > Submit </button>
									<button id = '1' onClick = {this.closeSongClicked.bind(this)}> Close </button>
								</div>
							</div>
							<div>
								<button id = '2' onClick = {this.selectSongClicked.bind(this)}> Select Song 3 </button>
								<div ref = {this.selectSongRefs[2]} style = {{display:'none'}}>
									<input />
									<button id = '2' onClick = {this.submitSongClicked.bind(this)} > Submit </button>
									<button id = '2'  onClick = {this.closeSongClicked.bind(this)}> Close </button>
								</div>
							</div>
						</div>
					</div>
					<div style = {{width:'490px'}}>
						<h1>Top 3 Artists</h1> 
						<div ref = {this.artistRefs[0]}>
							{this.props.user.artist0}
						</div>
						<div ref = {this.artistRefs[1]}>
							{this.props.user.artist1}
						</div>
						<div ref = {this.artistRefs[2]}>
							{this.props.user.artist2}
						</div>			
						<div style = {{display:user_display}}>
							<div>
								<div>
								<button id = '0' onClick = {this.selectArtistClicked.bind(this)}> Select Artist 1 </button>
								
								</div>
								<div ref = {this.selectArtistRefs[0]} style = {{display:'none'}}>
									<input />
									<button id = '0' onClick = {this.submitArtistClicked.bind(this)} > Submit </button>
									<button id = '0'  onClick = {this.closeArtistClicked.bind(this)}> Close </button>
								</div>
							</div>
							<div>
								<div>
								<button id = '1' onClick = {this.selectArtistClicked.bind(this)}> Select Artist 2 </button>
								
								</div>
								<div ref = {this.selectArtistRefs[1]} style = {{display:'none'}}>
									<input />
									<button id = '1' onClick = {this.submitArtistClicked.bind(this)} > Submit </button>
									<button id = '1' onClick = {this.closeArtistClicked.bind(this)}> Close </button>
								</div>
							</div>
							<div>
								<div>
								<button id = '2' onClick = {this.selectArtistClicked.bind(this)}> Select Artist 3 </button>
								
								</div>
								<div ref = {this.selectArtistRefs[2]} style = {{display:'none'}}>
									<input />
									<button id = '2' onClick = {this.submitArtistClicked.bind(this)} > Submit </button>
									<button id = '2'  onClick = {this.closeArtistClicked.bind(this)}> Close </button>
								</div>
							</div>
						</div>
					</div>
				</div>
		)
	}	
}

export default class UserPage extends React.Component{

	constructor(props) {
		super(props);
		this.offset = this.props.data.songs.length;
		this.postsRef = React.createRef();
		this.loading_posts_semaphor = false;
	}

	componentDidMount() 
	{
	    window.addEventListener('scroll', this.handleScroll.bind(this));
	    //this.updateOffsets(this.props.data.songs)
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
		    	that.postsRef.current.addPosts(data.songs, data.likes, data.num_comments)
		    	that.loading_posts_semaphor = false;
		 	})
		}
	}


  render() {

  	var display_top = '200px'
  	if (this.props.data.username == this.props.data.user.username)
  	{
  		display_top = '450px'
  	}

	return (
	<div>
		<UserInfo user = {this.props.data.user} username = {this.props.data.username}/>
		<FollowerInfo user = {this.props.data.user} follows={this.props.data.follows} followees={this.props.data.followees} username = {this.props.data.username} follow_type = {0}/>
		<div style = {{position:'relative', top:'150px'}}>
			<ProfilePicture user = {this.props.data.user} username = {this.props.data.username}/>
		</div>
		<div style = {{position:'relative', top:'170px'}}>
			<FavoriteSongs user = {this.props.data.user} username = {this.props.data.username}/>
		</div>
		<br/>
		
		<div style = {{position:'relative', top:display_top}} >
			<PostInfo ref = {this.postsRef} songs = {this.props.data.songs} likes = {this.props.data.likes} num_comments = {this.props.data.num_comments} user_profiles = {this.props.data.user_profiles} bumps = {this.props.data.bumps} />
		</div>
		<div className = "user_body" style={{left:'5%', top:'100px', position:'relative', width:'100%'}}>

		</div>


	</div>
	)};
}

