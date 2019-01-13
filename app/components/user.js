import React from 'react';
import StandardHeader from './standard_header.js'
import PostInfo from './post.js'
class UserInfo extends React.Component {

	constructor(props) {
		super(props);
		console.log("USER DATA")
		console.log(props)
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

	render()
	{
		return(
			<div className = "user_body" style={{left:'15%', top:'100px', position:'relative',width:'100%'}}>
				<div>
					<p> <a href = {"/followers/" + this.props.user.username}> Followers </a>: {this.props.follows.length} </p>
					<p> <a href = {"/following/" + this.props.user.username}> Following </a>: {this.props.followees.length} </p>
				</div>

				<button className = 'follow_button' id = "follow_button" type="button">Follow</button>
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
		console.log(props)
	}

  render() {
	return (
	<div>
		<StandardHeader/>
		<UserInfo user = {this.props.data.user}/>
		<FollowerInfo user = {this.props.data.user} follows={this.props.data.follows} followees={this.props.data.followees}/>
		<PostInfo songs = {this.props.data.songs} />

		<div className = "user_body" style={{left:'15%', top:'100px', position:'relative', width:'100%'}}>

		</div>


	</div>
	)};
}

