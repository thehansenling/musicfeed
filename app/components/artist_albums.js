import React from 'react';
import StandardHeader from './standard_header.js'

export default class ArtistAlbumsPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.albums = [];
	}

	generateAlbums()
	{
		for (var album of this.props.data.album_data) 
		{
			this.albums.push(
			<div style = {{display: 'flex',flexDirection:'column'}}>
				<h2>  <a href = {"/album/" + album.artist + "/" + album.album}>{album.album} </a></h2>
			</div>);
		}
	}

	render()
	{
		this.generateAlbums();
		return (
			<div>
				<div className = "albums_display" style = {{left:'15%', top:'100px', position:'relative'}}>
				<h1> Albums </h1>
					{this.albums}
				</div>	
			</div>
		);
	}
}