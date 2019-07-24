import React from 'react';
import StandardHeader from './standard_header.js'

export default class About extends React.Component{
	constructor(props){
		super(props);
	}

	componentDidMount()
	{
		this.props.mixpanel.track("About Page")
	}


	render() {
		return (
		<div>
			<section className = "hero">
				<div className =  "hero-content">
				</div>
			</section>

			<div style = {{paddingLeft:'5%', fontSize:'1.3em', width:'890px'}}>
				<h1>Getting started</h1>
				<p>
					1. First, make an account. To do so, click <a style = {{fontWeight:'bold'}} href = "/register"> register </a> in the top bar. Enter your email, select a username and password, then login with that information.
				</p>
				<p>	
				2. You can create a post directly from the <a style = {{fontWeight:'bold'}} href = "/"> home page </a>. For any post, you will also need to submit a Spotify embed link. 
				</p>
				<p>
				3. You can get this link by right clicking OR clicking the three dots by any song or album, and then navigating to Share -> Copy Embed Code (see screenshots below)
				</p>
				<div ><img style = {{width:'800px'}} src="/embedcodeinstructions.png" alt=""/></div>
				<p>
				4. If you submitted the link properly, you should see a Spotify element for your selected song/album/playlist populate. You can then provide a title and content for your post. 
				</p>
				<p>
				5. You have the option to tag Artists, Songs/Albums, and/or other Users in the body of any post. 
				a. To tag an artist, enter # and the artist’s name
				b. To tag a song/album, begin with the respective artist tag. Then type a hyphen “-“ and the title of the song/album.
				c. To tag a user, simply enter @ and the user’s name
				</p>
				<h1>Main feed</h1>
				<p>
				1. The <a style = {{fontWeight:'bold'}} href = "/"> main feed </a> collects all activity across the site and automatically sorts posts based on quality (a combination of score and recency) and users you follow (if you are logged in).
				</p>
				<p>
				2. You can vote on any user post directly from the main feed by clicking the up or down arrow underneath the respective Spotify element. A user will be notified if you vote on their post, and their user score will also update accordingly. 
				</p>
				<p>
				3. The sidebar contains a trending carousel, the weekly album for discussion, and a variety of random links from across the site.
				a. The trending carousel collects the top posts from across the site.
				b. The weekly discussion album will update each Friday. Clicking this element will bring you to the respective discussion post.
				</p>
				<p>
				4. The search bar is straightforward: you can directly search for any user, song, artist, or album. Artists/songs/albums will only show up in the search if a user has previously posted about them.
				</p>
				<h1>User profile</h1>
				<p>
				1. All the posts you write will be collected on your user profile. You can also see full lists of your followers and the people you follow by clicking on the respective counts underneath your username.
				</p>
				<p>
				2. You can change your profile picture color (purely aesthetic) by clicking “change” underneath that circle.
				</p>
				<p>
				3. You can write a brief profile description by clicking the “edit” button. 
				</p>
				<a style = {{fontWeight:'bold', fontSize:'1.5em'}} href = "/termsofservice"> Terms of Service </a>
				<br/>
				<a style = {{fontWeight:'bold', fontSize:'1.5em'}} href = "/privacypolicy"> Policy Privacy </a>
			</div>

		</div>
		);
	}
}


