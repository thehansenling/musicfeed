import React from 'react';
import StandardHeader from './standard_header.js'
import PostInfo from './post.js'
import FollowerInfo from './followerinfo.js'

class UserInfo extends React.Component {

	constructor(props) {
		super(props);
		this.description = props.user.description;
		this.description_ui = undefined
		if (this.props.username == this.props.user.username)
		{
			this.description_ui = <button onClick={this.editDescription.bind(this)}> Edit Description </button>;
		}
		this.description_text = React.createRef();
	}

    submitDescription()
    {
		var that = this;
	    fetch("/submit_description", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({text: that.description_text.current.value, user:that.props.user.username})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	that.description = that.description_text.current.value;
			that.description_ui = <button onClick={that.editDescription.bind(that)}> Edit Description </button>
		 	that.forceUpdate();
	 	})	

	}

	editDescription()
	{
		this.description_ui = <div>
		<textarea ref = {this.description_text} style={{width:'80%',height:'50px',zIndex:'100'}}></textarea>
		<button onClick = {this.submitDescription.bind(this)} style= {{height:'30px', bottom:'30px', position:'relative'}} type='button'>submit</button>
		<button onClick = {this.closeDescription.bind(this)} style= {{bottom:'0px', position:'relative', height:'30px'}} type='button'>x</button>
		</div>
		this.forceUpdate();
	}

	closeDescription()
	{
		this.description_ui = <button onClick={this.editDescription.bind(this)}> Edit Description </button>
		this.forceUpdate();
	}

	render ()
	{
		return(
			<div className = "user_info" style={{margin: '0 auto', paddingTop:'10px', paddingLeft: '10px', paddingBottom:'10px', background:'white', border:'gray solid 1px', borderRadius:'4px', position:'relative', top:'100px', position:'relative', maxWidth:'980px'}}>
				<div style = {{fontSize:'30pt'}}>{this.props.user.username}</div>
				<div style = {{fontSize:'18pt'}}>{this.description}</div>
				{this.description_ui}
				<div style = {{fontSize:'18pt'}}>Score: {this.props.user.upvotes - this.props.user.downvotes}</div>
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
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_posts_semaphor) 
		{
			var that = this
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
		<UserInfo user = {this.props.data.user} username = {this.props.data.username}/>
		<FollowerInfo user = {this.props.data.user} follows={this.props.data.follows} followees={this.props.data.followees} username = {this.props.data.username} follow_type = {0}/>
		<br/>
		<br/>
		<PostInfo ref = {this.postsRef} songs = {this.props.data.songs} likes = {this.props.data.likes} num_comments = {this.props.data.num_comments}/>

		<div className = "user_body" style={{left:'5%', top:'100px', position:'relative', width:'100%'}}>

		</div>


	</div>
	)};
}

