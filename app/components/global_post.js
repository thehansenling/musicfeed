import React from 'react';
import StandardHeader from './standard_header.js'
import CommentSection from './comments.js'

class GlobalPostContent extends React.Component 
{
	constructor(props)
	{
		super(props);
		console.log("GLOBALPOSTCONTENT");
		console.log(props)
		this.album_songs = []
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}

	generateAlbumSongs()
	{
		//for (key of Object.keys(JSON.parse(data[0].data)))
		for (var song of Object.keys(this.props.data.data))
		{
			console.log(song)
			this.album_songs.push(<div style = {{padding:'0px'}}> {song + "."} <a href = "test"> {this.props.data.data[song]} </a></div>)
		}
	}

	render()
	{
		var song = <div> {this.props.data.song + " by "} <a href = {"/artist/" + this.props.data.artist}> {this.props.data.artist} </a> </div>
		console.log(song)
		if (this.props.data.type == 1)
		{
			song = ""
			this.generateAlbumSongs();
		}


		return (
			<div>
				<div style={{position:'relative', top:'100px', paddingBottom:'100px', height: 'auto', minHeight: '550px'}}>
					<div style={{position:'relative',float:'left', top:'0px', paddingRight:'20px'}} dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}>
					</div>
					<div style={{left:'10%', top:'20%'}}>

						<div>
							{song}
							<div> Album: {this.props.data.album} </div>
							<div> Released on: {this.props.data.release_date} </div>
						</div>


					</div>
				</div>
				<br/>
				<br/>
				<br/>
				<br/>
				<meta className = "comment_offset" content = "0" />
				<button type='button' className = 'new_comment' id = "-1" className = 'level_-1' style={{position:'relative'}}>Comment</button>
			</div>
		);
	}
}

export default class GlobalPost extends React.Component
{
	constructor(props)
	{
		console.log("HEYEBUD")
		console.log(props)
		super(props);
	}

	render()
	{
		return (
			<div>
				<StandardHeader/>
				<GlobalPostContent data = {this.props.data.data}/>
				<CommentSection data = {this.props.data}/>
			</div>
		);
	}
}