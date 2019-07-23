import React from 'react';
import StandardHeader from './standard_header.js'

export default class FollowersPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.followers = []
		
	}

	componentDidMount()
	{
		this.props.mixpanel.track("Followers Page", {"Followee":this.props.user})
	}
	
	generateFollowers()
	{
		for (var follower of this.props.data.followers) 
		{
			this.followers.push(<div key = {follower.user_id}><a href = {"/user/" + follower.user_id}>{follower.user_id}</a></div>)
		}
	}	

	render()
	{
		this.generateFollowers();
		return (
			<div>
				<div className = "followers_div" style = {{left:'15%', top:'100px', position:'relative'}}>
					<h1> Followers </h1>
						{this.followers}
				</div>
			</div>
		);
	}
}