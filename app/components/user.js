import React from 'react';
import StandardHeader from './standard_header.js'
import PostInfo from './post.js'
class UserInfo extends React.Component {

	constructor(props) {
		super(props);
	}

	render ()
	{
		return(
			<div className = "user_info" style={{position:'relative',left:'15%', top:'100px', position:'relative',width:'100%'}}>
				<h1>{this.props.user.username}</h1>
				<h2>{this.props.user.description}</h2>
				<h2>{this.props.user.upvotes - this.props.user.downvotes}</h2>
			</div>
		);
	}
}

class FollowerInfo extends React.Component {
	constructor(props) {
		super(props)

	}

	followClicked()
	{
		var that = this;
	    fetch("/follow", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({followee_id: that.props.user.username,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	 	})	
	}

	render()
	{
		return(
			<div className = "user_body" style={{left:'15%', top:'100px', position:'relative',width:'100%'}}>
				<div>
					<p> <a href = {"/followers/" + this.props.user.username}> Followers </a>: {this.props.follows} </p>
					<p> <a href = {"/following/" + this.props.user.username}> Following </a>: {this.props.followees} </p>
				</div>

				<button className = 'follow_button' id = "follow_button" type="button" onClick = {this.followClicked.bind(this)}>Follow</button>
				<div className="follow_icon">
					Not Following
				</div>
			</div>
		);
	}
}

export default class UserPage extends React.Component{

	constructor(props) {
		super(props);
		this.offset = this.props.data.songs.length;
		this.postsRef = React.createRef();
		this.loading_posts_semaphor = false;
	}

	componentDidMount() 
	{
	    window.addEventListener('scroll', this.handleScroll.bind(this));
	    //this.updateOffsets(this.props.data.songs)
	}

	componentWillUnmount() 
	{
	    window.removeEventListener('scroll', this.handleScroll.bind(this));
	}

	handleScroll() {
		console.log(this.props.data.username)
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_posts_semaphor) 
		{
			var that = this
			console.log("LOADING NEW POSTS")
			this.loading_posts_semaphor = true
		    fetch("/load_post_data", {
		        method: "POST",
		        headers: {
		        	'Accept': 'application/json',
		        	'Authorization': 'Basic',
		        	'Content-Type': 'application/json',
		        },
		        body: JSON.stringify({offset:that.offset,
		        					  user: that.props.data.username})})
		    .then(function(response) { return response.json();})
		    .then(function (data) { 
		    	that.offset += data.songs.length;
		    	that.postsRef.current.addPosts(data.songs, data.likes, data.num_comments)
		    	that.loading_posts_semaphor = false;
		 	})
		}
	}

  render() {
	return (
	<div>
		<UserInfo user = {this.props.data.user}/>
		<FollowerInfo user = {this.props.data.user} follows={this.props.data.follows} followees={this.props.data.followees}/>
		<PostInfo ref = {this.postsRef} songs = {this.props.data.songs} likes = {this.props.data.likes} num_comments = {this.props.data.num_comments}/>

		<div className = "user_body" style={{left:'15%', top:'100px', position:'relative', width:'100%'}}>

		</div>


	</div>
	)};
}

