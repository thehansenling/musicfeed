
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
import PrivacyPolicy from './PrivacyPolicy.js'
import TermsOfService from './TermsofService.js'
import StandardHeader from './standard_header.js'
import mixpanel from 'mixpanel-browser';
import { MixpanelProvider, MixpanelConsumer } from 'react-mixpanel';
//	<Route path = "/user/:user" exact component={User} />
// <Route path = "/user" exact render={() => (<Home data={{hmm:"what"}}/>)}  />
export default class App extends React.Component{

	constructor(props)
	{
		super(props)
		mixpanel.init("63586aff50e8055326d4fb5944633383");
	}

	handleClick(e)
	{
		console.log("CLICKED");
	}
	componentWillMount()
	{
		if (typeof window !== 'undefined') 
		{
			document.body.style.backgroundColor = "rgb(242, 242, 242)";
			document.body.style.marginTop = "60px";
		}
	}
	componentDidMount()
	{
		if (typeof window !== 'undefined') 
		{
			document.body.style.backgroundColor = "rgb(242, 242, 242)";
			document.body.style.marginTop = "60px";
		}
		
		//mixpanel.track("An event");
	}
	//#FAFAFA
	render()
	{
		//mixpanel.init("63586aff50e8055326d4fb5944633383");
		return (
			<div className = "App" id='root' style = {{width:'100%', minWidth:'1200px'}}>
			<MixpanelProvider>
				<StandardHeader username = {this.props.data.username} notifications = {{}}/>
				<link rel="stylesheet" href="/styles.css"/>
				<Switch>
					<Route exact path = "/" render={() => (<Feed data={this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/user/:user/:post_id" render={() => (<UserPost data={this.props.data} mixpanel = {mixpanel}/>)}/>
					<Route exact path = "/user/:user/:post_id/likes" render={() => (<UserPostLikesPage data={this.props.data} mixpanel = {mixpanel}/>)}/>
					<Route exact path = "/user/:user"  render={() => (<User data={this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/followers/:user"  render={() => (<Followers data={this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/following/:user"  render={() => (<Following data={this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/login" render = {() => (<Login data={this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/register" render = {() => (<Register data={this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/post/:artist/:song" render = {() => (<GlobalPost data={this.props.data} mixpanel = {mixpanel} />)} />
					<Route exact path = "/album/:artist/:album" render = {() => (<GlobalPost data={this.props.data} mixpanel = {mixpanel} />)} />
					<Route exact path = "/artist/:artist" render={() => (<ArtistPost data = {this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/artist/:artist/songs" render={() => (<ArtistSongsPost data = {this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/artist/:artist/albums" render={() => (<ArtistAlbumsPost data = {this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/contact" render={() => (<Contact data = {this.props.data} mixpanel = {mixpanel}/>)} />
					<Route exact path = "/about" render={() => (<About data = {this.props.data} mixpanel = {mixpanel}/>)}/>
					<Route exact path = "/termsofservice" render={() => (<TermsOfService data = {this.props.data} mixpanel = {mixpanel}/>)}/>
					<Route exact path = "/privacypolicy" render={() => (<PrivacyPolicy data = {this.props.data} mixpanel = {mixpanel}/>)}/>
				</Switch>	
				<script type="text/javascript" src="/public/bundle.js"> </script>
			</MixpanelProvider>
			</div>
		);
	}
}
