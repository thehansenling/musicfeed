
import React from 'react';
import {render} from 'react-dom';
import {
	BrowserRouter as Router,
	Redirect, 
	Route,
	Switch
} from 'react-router-dom';


//import List from './List';
import Home from './Home';
import Feed from './feed.js'
import Contact from './Contact.js';
import About from './about.js';
import User from './user.js';
import UserPost from './user_post.js'
import GlobalPost from './global_post.js'
import ArtistPost from './artist.js'
import ArtistSongsPost from './artist_songs.js'
import ArtistAlbumsPost from './artist_albums.js'
import Login from './login.js'
import Register from './register.js'
import Followers from './followers.js'
import Following from './following.js'
import UserPostLikesPage from './userpostlikes.js'
import StandardHeader from './standard_header.js'
//	<Route path = "/user/:user" exact component={User} />
// <Route path = "/user" exact render={() => (<Home data={{hmm:"what"}}/>)}  />
export default class App extends React.Component{

	constructor(props)
	{
		super(props)
	}

	handleClick(e)
	{
		console.log("CLICKED");
	}
	componentWillMount()
	{
		if (typeof window !== 'undefined') 
		{
			document.body.style.backgroundColor = "#FFFFFF";
		}
	}
	//#FAFAFA
	render()
	{

		return (
			<div className = "App" id='root' style = {{width:'100%', minWidth:'1200px'}}>
				<StandardHeader username = {this.props.data.username} notifications = {this.props.data.notifications}/>
				<link rel="stylesheet" href="/styles.css"/>
				<Switch>
					<Route exact path = "/" render={() => (<Feed data={this.props.data}/>)} />
					<Route exact path = "/user/:user/:post_id" render={() => (<UserPost data={this.props.data}/>)}/>
					<Route exact path = "/user/:user/:post_id/likes" render={() => (<UserPostLikesPage data={this.props.data}/>)}/>
					<Route exact path = "/user/:user"  render={() => (<User data={this.props.data}/>)} />
					<Route exact path = "/followers/:user"  render={() => (<Followers data={this.props.data}/>)} />
					<Route exact path = "/following/:user"  render={() => (<Following data={this.props.data}/>)} />
					<Route exact path = "/login" render = {() => (<Login data={this.props.data}/>)} />
					<Route exact path = "/register" render = {() => (<Register data={this.props.data}/>)} />
					<Route exact path = "/post/:artist/:song" render = {() => (<GlobalPost data={this.props.data} />)} />
					<Route exact path = "/album/:artist/:album" render = {() => (<GlobalPost data={this.props.data} />)} />
					<Route exact path = "/artist/:artist" render={() => (<ArtistPost data = {this.props.data}/>)} />
					<Route exact path = "/artist/:artist/songs" render={() => (<ArtistSongsPost data = {this.props.data}/>)} />
					<Route exact path = "/artist/:artist/albums" render={() => (<ArtistAlbumsPost data = {this.props.data}/>)} />
					<Route exact path = "/contact" render={() => (<Contact data = {this.props.data}/>)} />
					<Route exact path = "/about"  component={About} />
				</Switch>	
				<script type="text/javascript" src="/public/bundle.js"> </script>
			</div>
		);
	}
}
