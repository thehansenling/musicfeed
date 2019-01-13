import React from 'react';
import StandardHeader from './standard_header.js'
import PostInfo from './post.js'

class NewPostSubmission extends React.Component {
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
		 	<div id = "post" style ={{left:'15%',top:'120px',position:'relative'}} width="100%" autocomplete="off">
				Song/Playlist: 
				<br/>
				<input id="song" type="text" name="song" style={{width:'80%'}}/>
				<br/>
					Title:
				<br/>
				<input id="title" type="text" name="title" style={{width:'80%'}}/>  
				<textarea id = "content" name="content" rows="10" cols="90" style={{width:'80%',height:'50px'}}></textarea>
				<br/>
				<button id = "post_button" type="button">Post</button>
				<br/>
				<br/>
				<div id="showsong" style = {{position:'absolute',top:'0',left:'40%'}}>

				</div>
				<meta className = "post_number" content = "0"/>
				<meta className = "non_priority_post_number" content = "0"/>
				<meta className = "global_post_number" content = "0"/>
				<meta className = "non_priority_global_post_number" content = "0"/>
			</div>
		);
	}
}

export default class Feed extends React.Component{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
			<div>
				<StandardHeader />
				<NewPostSubmission />
				<PostInfo songs = {this.props.data.songs} />
			</div>
		);
	}

}