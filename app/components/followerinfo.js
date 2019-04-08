import React from 'react';

export default class FollowerInfo extends React.Component {
	constructor(props) {
		super(props)
		this.following_state = false;
		this.following_ui = "Not Following"
		this.follows_num = this.props.follows.length;
		for (var follow of props.follows)
		{
			if (follow.user_id == props.username)
			{
				this.following_ui = "Following"
				this.following_state = true;
				break;
			}
		}
		this.button_text = "Follow"
	}

	followClicked()
	{
		var that = this;
		if (this.following_state)
		{
			this.following_ui = "Not Following"
			this.button_text = "Follow"
			this.following_state = false
			this.follows_num -= 1
		}
		else
		{
			this.following_ui = "Following"
			this.button_text = "Unfollow"
			this.following_state = true;
			this.follows_num += 1
		}
		var followee;
		if (that.props.follow_type == 0)
		{
			followee = that.props.user.username
		}
		else
		{
			followee = that.props.artist
		}
	    fetch("/follow", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({followee_id: followee, type:that.props.follow_type,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	
	 	})	
	 	this.forceUpdate();
	}

	render()
	{
		var following_content;
		var followers_content;
		var follow_info_style;
		if (this.props.follow_type == 0)
		{
			following_content = <span> <a href = {"/following/" + this.props.user.username}> Following </a>: {this.props.followees} </span>
			followers_content = <span> <a href = {"/followers/" + this.props.user.username}> Followers </a>: {this.follows_num} </span>
			follow_info_style = {margin: '0 auto', paddingTop:'10px', paddingLeft: '10px', paddingBottom:'10px', top:'100px', position:'relative',width:'980px', background:'white', border:'gray solid 1px', borderRadius:'4px', position:'relative', top:'100px', position:'relative', maxWidth:'980px'}
		} 
		else if (this.props.follow_type == 1)
		{
			followers_content = <span> <a href = {"/followers/" + this.props.artist}> Followers </a>: {this.follows_num} </span>
			follow_info_style = {left: '0%', paddingTop:'10px', paddingLeft: '10px', paddingBottom:'10px', top:'100px', position:'relative',width:'980px', background:'white', border:'gray solid 1px', borderRadius:'4px', position:'relative', top:'0px', position:'relative', maxWidth:'800px'}
		}
		return(
			<div className = "user_body" style={follow_info_style}>
				<div>
					{followers_content}
					{following_content}
				</div>

				<button className = 'follow_button' id = "follow_button" type="button" onClick = {this.followClicked.bind(this)}>{this.button_text}</button>
				<div className="follow_icon">
					{this.following_ui}
				</div>
			</div>
		);
	}
}
