import React from 'react';
import StandardHeader from './standard_header.js'

export default class ArtistSongsPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.songs = [];
	}

	componentDidMount()
	{
		this.props.mixpanel.track("Artist Songs Page", {"Artist":this.props.artist})
	}

	generateSongs()
	{
		for (var song of this.props.data.song_data) 
		{
			this.songs.push(
			<div key ={song.post_id} style = {{display: 'flex',flexDirection:'column'}}>
				<h2>  <a href = {"/post/" + song.artist + "/" + song.song}>{song.song} </a></h2>
			</div>)
		}
	}

	render()
	{
		this.generateSongs();
		return (
			<div>
				<div className = "songs_display" style = {{left:'15%', top:'100px', position:'relative'}}>
				<h1> Songs </h1>
					{this.songs}
				</div>	
			</div>
		);
	}
}