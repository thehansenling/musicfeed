import React from 'react';
import StandardHeader from './standard_header.js'

export default class FollowingPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.follows = []
	}

	generateFollows()
	{
		for (var follow of this.props.data.following) 
		{
			this.follows.push(<div key = {follow.user_id}><a href = {"/user/" + follow.user_id}>{follow.user_id}</a></div>)
		}
	}	

	render()
	{
		this.generateFollows();
		return (
			<div>
				<StandardHeader/>
				<div className = "follows_div" style = {{left:'15%', top:'100px', position:'relative'}}>
					<h1> Follows </h1>
						{this.follows}
				</div>
			</div>
		);
	}
}