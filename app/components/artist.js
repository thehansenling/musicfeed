import React from 'react';
import StandardHeader from './standard_header.js'

class FollowingInfo extends React.Component
{
	constructor(props)
	{
		super(props)
	}

	render()
	{
		return (
			<div>
				x 
				<button className = 'follow_button' id = "follow_button" type="button">Follow</button>
				<div className ="follow_icon">
					Not Following
				</div>
			</div>			
		);
	}
}

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
		for (var album of this.props.data) 
		{
			this.albums.push(
			<div style = {{display: 'flex', flexDirection:'column', padding:'10px'}}>
				{album.album}
				<div dangerouslySetInnerHTML={this.renderiframe(album.embedded_content)}></div>
			</div>)
		}
	}

	render()
	{
		this.generateAlbums();
		return (
				<div>
					<h1> <a href= {"/artist/" + this.props.artist + "/albums"}> Albums </a> </h1> 
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
		for (var song of this.props.data) 
		{
			this.songs.push(
			<div style = {{display: 'flex', flexDirection:'column', padding:'10px'}}>
				{song.song}
				<div dangerouslySetInnerHTML={this.renderiframe(song.embedded_content)}></div>
			</div>)
		}
	}

	render()
	{
		this.generateSongs();
		return (
				<div>
					<h1> <a href= {"/artist/" + this.props.artist + "/songs"}> Songs </a> </h1> 
					<div className = "song_display" style = {{display: 'flex',flexDirection:'row'}} >
						{this.songs}
					</div>
				</div>
			
		);
	}
}

export default class ArtistPost extends React.Component
{
	constructor(props)
	{
		super(props);
		console.log("ARTIST PAGE")
		console.log(props);
	}

	render()
	{
		return (
			<div>
				<StandardHeader />
				<div className = "info_container" style={{left:'15%', top:'200px', position:'relative',width:'100%'}}>
					<FollowingInfo />
					<AlbumDisplay data = {this.props.data.album_data} artist = {this.props.data.artist}/>
					<SongDisplay data = {this.props.data.song_data} artist = {this.props.data.artist}/>
				</div>

			</div>
		);
	}
}