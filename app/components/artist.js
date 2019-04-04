import React from 'react';
import StandardHeader from './standard_header.js'
import FollowerInfo from './followerinfo.js'
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
				<div dangerouslySetInnerHTML={this.renderiframe(album.embedded_content)}></div>
			</div>)

		}
	}

	render()
	{
		this.generateAlbums();
		return (
				<div style = {{maxWidth:'800px'}}>
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
		var song_count = 0;
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
				<div dangerouslySetInnerHTML={this.renderiframe(song.embedded_content)}></div>
			</div>)
		}
	}

	render()
	{
		this.generateSongs();
		return (
				<div style = {{maxWidth:'800px'}}>
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
	}

	render()
	{
		return (
			<div style={{paddingLeft:'5%', paddingTop:'100px', position:'relative'}}>
				<h1> {this.props.data.artist} </h1>
				<FollowerInfo artist = {this.props.data.artist} follows={this.props.data.follows} username = {this.props.data.username} follow_type = {1}/>
				<AlbumDisplay data = {this.props.data.album_data} artist = {this.props.data.artist}/>
				<SongDisplay data = {this.props.data.song_data} artist = {this.props.data.artist}/>
			</div>
		);
	}
}