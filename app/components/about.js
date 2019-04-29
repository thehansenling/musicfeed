import React from 'react';
import StandardHeader from './standard_header.js'

export default class About extends React.Component{
	constructor(props){
		super(props);


	}

	componentDidMount()
	{

	}


	render() {
		return (
		<div>
			<section className = "hero">
				<div className =  "hero-content">
					<h2>All about us</h2>
				</div>
			</section>

			<div className = "jumbotron text-center" style = {{fontSize:'2em'}}>
				<p>1. Click register, enter name, password. Login using that info </p>
				<p>2. To submit content. Get a spotify embed link. Go to a song or album, click ...->share->copy embed code. past in the song/playlist section. Enter in a title and text</p>
				<p>
				<div style = {{}}><img src="/embedcodeinstructions.png" alt=""/></div>
				</p>
				<p>3. You can search for a song, album, user, or artist. This will bring you to a global post about the song or album. This should have all data from posts about that topic</p>
			</div>
		</div>
		);
	}
}


