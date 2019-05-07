import React from 'react';
import StandardHeader from './standard_header.js'

export default class UserPostLikesPage extends React.Component
{
	constructor(props)
	{
		super(props)
		this.likes = []
		this.dislikes = []
	}

	generatelikes()
	{
		for (var like of this.props.data.likes) 
		{
			this.likes.push(<div key = {like.user_id}><a href = {"/user/" + like.user_id}>{like.user_id}</a></div>)
		}
		for (var dislike of this.props.data.dislikes) 
		{
			this.dislikes.push(<div key = {dislike.user_id}><a href = {"/user/" + dislike.user_id}>{dislike.user_id}</a></div>)
		}
	}	

	render()
	{
		this.generatelikes();
		return (
			<div style = {{display:'flex', flexDirection:'row', left:'15%', top:'100px', position:'relative'}}>
				<div className = "likes" style = {{paddingRight: '10%', borderRight:'2px solid black'}}>
					<h1> Likes </h1>
						{this.likes}
				</div>
				<div className = "dislikes" style = {{paddingLeft: '10%'}}>
					<h1> Dislikes </h1>
						{this.dislikes}
				</div>
			</div>
		);
	}
}