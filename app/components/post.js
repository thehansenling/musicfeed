import React from 'react';

class Post extends React.Component 
{
	constructor(props) 
	{
		super(props);
		// props.id = "";
		// props.like_state = -1;
	}	

	renderiframe(iframe) {
		return {
			__html: iframe
		}
	}

	render()
	{
		var date = new Date(this.props.song.timestamp)
		var post_title = <h1 style= {{position:'relative'}}><a href = {"user/" + this.props.song.username + "/" + this.props.song.id} > {this.props.song.title}</a></h1>;
		var poster_username = this.props.song.username;
		var poster_username_url = "/user/" + this.props.song.username;
		var content = <h2 style={{position:'relative'}}>{this.props.song.content}</h2>
		var by_text = " by"


		var likes_section = <div>
			<div className="likes" id = {this.props.song.post_id} >Likes: {this.props.song.likes - this.props.song.dislikes}</div>
			<button type="button" className = "like" id = {this.props.song.post_id}>Like</button>
			<button type="button" className = "unlike" id = {this.props.song.post_id}>Hate</button>
			</div>

		var comment_section = <div className= "comment_section" id = {this.props.song.post_id} />

		if (this.props.song.username != undefined)
		{
			post_title = "";
			likes_section = <div>
			<div className="likes" id = {this.props.song.id} >Likes: {this.props.song.likes - this.props.song.dislikes}</div>
			<button type="button" className = "like" id = {this.props.song.id}>Like</button>
			<button type="button" className = "unlike" id = {this.props.song.id}>Hate</button>
			</div>
			comment_section = <div className= "comment_section" id = {this.props.song.id} />
			by_text = " posted by"
		}


		var content_url = "/post/" + this.props.song.artist + "/" + this.props.song.song;
		var content_name = this.props.song.song;

		if (this.props.song.song == "NO_SONG_ALBUM_ONLY")
		{
			content_url = "/album/" + this.props.song.song.artist + "/" + this.props.song.song.album;
			content_name = this.props.song.album;
		}

		return(

 		<div style={{position:'relative', height:'480px',borderBottom: '4px solid gray',padding:'5px'}}>
 			<div style = {{display: 'flex',flexDirection:'row'}}>
	 			<span style={{width:'600px'}}>
	 				{post_title}
	 				<div style = {{display: 'flex',flexDirection:'row'}}>
	 				
	 				<h3> <a href = 
	 						{content_url}  > {content_name} 
	 					</a>
		 				 {by_text}
		 				<a href ={poster_username_url} > {poster_username} </a> at 
		 				{" " + date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear()} 
	 				</h3>
	 				</div>
	 					{content}
	 			</span>
	 			<span dangerouslySetInnerHTML={this.renderiframe(this.props.song.embedded_content)}>
	 			</span>
 			</div>
			<div className= "like_section">
				{likes_section}
			</div>
			<div className= "comment_section" id = {this.props.song.id} >
				{comment_section}
				Comments: 0
			</div>
 		</div>

		);
	}
}

export default class PostInfo extends React.Component 
{
	constructor(props) 
	{
		super(props);
		console.log("POSTINFO")
		this.posts = [];
	}

	makePost(song)
	{
		this.posts.push(<Post key={song.id} song={song} />);
	}

	addSongs()
	{
		for (var song of this.props.songs)
		{
			this.makePost(song);
		}
	}

	render()
	{
		this.addSongs();
		return(
			<div style={{left:'15%', top:'100px', position:'relative',width:'100%'}}>
				{this.posts}
			</div>
		);
	}
}