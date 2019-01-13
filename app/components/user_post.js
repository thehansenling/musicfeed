import React from 'react';
import StandardHeader from './standard_header.js'
import CommentSection from './comments.js'

class UserPostContent extends React.Component 
{
	constructor(props)
	{
		super(props);
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}

	render()
	{
		return (
			<div>
				<div style={{position:'relative', top:'100px', paddingBottom:'100px', height: 'auto', minHeight: '550px'}}>
					<div style={{position:'relative',float:'left', top:'0px', paddingRight:'20px'}} dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}>
					</div>
					<div style={{left:'10%', top:'20%'}}>
					  	{this.props.data.content}
					</div>
				</div>
				<br/>
				<br/>
				<br/>
				<br/>
				<meta className = "comment_offset" content = "0" />
				<button type='button' className = 'new_comment' id = "-1" className = 'level_-1' style={{position:'relative'}}>Comment</button>
			</div>
		);
	}
}

export default class UserPost extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
			<div>
				<StandardHeader/>
				<UserPostContent data = {this.props.data.user_post}/>
				<CommentSection data = {this.props.data}/>
			</div>
		);
	}
}