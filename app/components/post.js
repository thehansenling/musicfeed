import React from 'react';

class Post extends React.Component 
{
	constructor(props) 
	{
		super(props);
		console.log("POST PROPS")
		console.log(props)
		this.likes_score = this.props.song.likes - props.song.dislikes;
		this.likeRef = React.createRef();
		this.dislikeRef = React.createRef();
	}	

	renderiframe(iframe) {
		return {
			__html: iframe
		}
	}

	likeClicked()
	{
		var that = this;
		var id = that.props.song.post_id;
		if (id == undefined)
		{
			id = that.props.song.id;
		}

		var post_url = "/like"
		if (that.props.song.username == undefined)
		{
			console.log("global like")
			post_url = "/global_like"
		}


		console.log("back 0	")
	    fetch(post_url, {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({user: that.props.song.username, id: id,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	// that.likes_score = data.likes_score;
	    	// that.like_state = data.like_state;
	    	// if (that.like_state == 1)
	    	// {
	    	// 	console.log("back 1")
	    	// 	that.likeRef.current.style.color = 'blue'
	    	// 	that.dislikeRef.current.style.color = 'black'
	    	// }
	    	// else if (that.like_state == 0)
	    	// {
	    	// 	console.log("back 2")
	    	// 	that.likeRef.current.style = 'black'
	    	// 	that.dislikeRef.current.style.color = 'red'
	    	// }
	    	// else
	    	// {
	    	// 	console.log("back 3")
	    	// 	that.likeRef.current.style = 'black'
	    	// 	that.dislikeRef.current.style.color = 'black'	    		
	    	// }
	 	})	

    	if (this.props.like_state == 1)
    	{
       		this.likes_score -= 1;
    		this.likeRef.current.style = 'black'
    		this.dislikeRef.current.style.color = 'black'
    		this.props.like_state = -1;
    	}
    	else
    	{
    		if (this.props.like_state == -1)
    		{
    			this.likes_score += 1;
    		}
    		else 
    		{
    			this.likes_score += 2;
    		}
    		this.likeRef.current.style = 'blue'
    		this.dislikeRef.current.style.color = 'black'
    		this.props.like_state = 1;
    	}

    	this.forceUpdate();
	}

	dislikeClicked()
	{
		var that = this;
		var id = that.props.song.post_id;
		if (id == undefined)
		{
			id = that.props.song.id;
		}

		var post_url = "/dislike"
		if (that.props.song.username == undefined)
		{
			console.log("global dislike")
			post_url = "/global_dislike"
		}


	    fetch(post_url, {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({user: that.props.song.username, id: id,})})
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	// that.likes_score = data.likes_score;
	    	// that.like_state = data.like_state;
	    	// if (that.like_state == 1)
	    	// {
	    	// 	that.likeRef.current.style.color = 'blue'
	    	// 	that.dislikeRef.current.style.color = 'black'
	    	// }
	    	// else if (that.like_state == 0)
	    	// {
	    	// 	that.likeRef.current.style = 'black'
	    	// 	that.dislikeRef.current.style.color = 'red'
	    	// }
	    	// else
	    	// {
	    	// 	that.likeRef.current.style = 'black'
	    	// 	that.dislikeRef.current.style.color = 'black'		
	    	// }
	    	// that.forceUpdate();
	 	})	

    	if (this.props.like_state == 0)
    	{
    		this.likeRef.current.style = 'black'
    		this.dislikeRef.current.style.color = 'black'	 
    		this.props.like_state = -1;
    		this.likes_score += 1;
    	}
    	else
    	{
    		if (this.props.like_state == -1)
    		{
    			this.likes_score -= 1;
    		}
    		else 
    		{
    			this.likes_score -= 2;
    		}
    		this.likeRef.current.style = 'black'
    		this.dislikeRef.current.style.color = 'red'
    		this.props.like_state = 0;

    	}
    	this.forceUpdate();
	}

	render()
	{
		var date = new Date(this.props.song.timestamp)
		var post_title = <h1 style= {{position:'relative'}}><a href = {"/user/" + this.props.song.username + "/" + this.props.song.id} > {this.props.song.title}</a></h1>;
		var poster_username = this.props.song.artist;
		var poster_username_url = "/artist/" + this.props.song.artist;
		var content = <h2 style={{position:'relative'}}>{this.props.song.content}</h2>
		var by_text = " by"
		var at_text = " posted at "

		var post_id = this.props.song.post_id;



		if (this.props.song.username != undefined)
		{
			post_id = this.props.song.id;
			//post_title = "";
			by_text = " posted by " 
			at_text = " at "
			poster_username = this.props.song.username;
			poster_username_url = "/user/" + this.props.song.username;
		}

		var like_style = {color:'black'}
		var dislike_style = {color:'black'}
		if (this.props.like_state == 1)
		{
			like_style.color = 'blue';
		}
		else if (this.props.like_state == 0)
		{
			dislike_style.color = 'red';
		}

		var likes_section = <div>
			<div  className="likes" id = {post_id} >Likes: {this.likes_score} </div>
			<button ref = {this.likeRef} onClick = {this.likeClicked.bind(this)} type="button" className = "like" id = {post_id} style = {like_style}>Like</button>
			<button ref = {this.dislikeRef} onClick = {this.dislikeClicked.bind(this)} type="button" className = "unlike" id = {post_id} style = {dislike_style}>Hate</button>
			</div>
		var comment_section = <div className= "comment_section" id = {post_id} />
		var content_url = "/post/" + this.props.song.artist + "/" + this.props.song.song;
		var content_name = this.props.song.song;

		if (this.props.song.song == "NO_SONG_ALBUM_ONLY")
		{
			content_url = "/album/" + this.props.song.artist + "/" + this.props.song.album;
			content_name = this.props.song.album;
		}

		return(

 		<div key = {this.props.song.post_id} style={{position:'relative', height:'480px',borderBottom: '4px solid gray',padding:'5px'}}>
 			<div style = {{display: 'flex',flexDirection:'row'}}>
	 			<span style={{width:'600px'}}>
	 				{post_title}
	 				<div style = {{display: 'flex',flexDirection:'row'}}>
	 				
	 				<h3> <a href = 
	 						{content_url}  > {content_name} 
	 					</a>
		 				 {by_text}
		 				<a href ={poster_username_url} > {poster_username} </a> {at_text}
		 				{" " + date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear()} 
	 				</h3>
	 				</div>
	 					{content}
	 			</span>
	 			<span dangerouslySetInnerHTML={this.renderiframe(this.props.song.embedded_content)}>
	 			</span>
 			</div>
			<div className= "like_section">
				{likes_section}
			</div>
			<div className= "comment_section" id = {this.props.song.id} >
				{comment_section}
				Comments: {this.props.num_comments}
			</div>
 		</div>

		);
	}
}

export default class PostInfo extends React.Component 
{
	constructor(props) 
	{
		super(props);
		this.posts = [];
	}

	makePost(song)
	{
		var like_state = -1;
		var current_num_comments = 0;
		console.log(this.props)
		console.log("props")
		for (var like of this.props.likes)
		{
			var id = like.post_id
			if (id == undefined)
			{
				id = like.id;
			}

			var post_id = song.id;
			if (post_id == undefined)
			{
				post_id = song.post_id;
			}

			if (id == post_id)
			{
				console.log("FOUND A LIKE STATE")

				like_state = like.like_state;
				console.log(like_state)
			}
		}
		for (var num_comments of this.props.num_comments)
		{
			current_num_comments = 0;
			if (song.post_id == num_comments.post_id)
			{
				current_num_comments = num_comments.count			
			}
		}
		this.posts.push(<Post key={song.post_id} song={song} like_state = {like_state} num_comments = {current_num_comments}/>);
	}

	addSongs()
	{
		for (var song of this.props.songs)
		{
			this.makePost(song);
		}
	}

	addPosts(songs, likes, all_num_comments)
	{
		for (var song of songs)
		{
			var like_state = -1;
			var current_num_comments = 0;

			for (var like of likes)
			{
				var id = like.post_id
				if (id == undefined)
				{
					id = like.id;
				}

				var post_id = song.id;
				if (post_id == undefined)
				{
					post_id = song.post_id;
				}

				if (id == post_id)
				{
					console.log("FOUDN ID")
					like_state = like.like_state;
				}
			}
			for (var num_comments of all_num_comments)
			{
				var id = num_comments.post_id
				if (id == song.post_id)
				{
					current_num_comments = num_comments.count;
					break;
				}
			}
			this.posts.push(<Post key={song.post_id} song={song} like_state = {like_state} num_comments = {current_num_comments}/>);
		}
		this.forceUpdate()
	}

	componentDidMount() {
	    this.addSongs();
	    this.forceUpdate();
	}
	

	render()
	{
		
		return(
			<div style={{left:'15%', top:'100px', position:'relative',width:'100%'}}>
				{this.posts.map((post) => {return post})}
			</div>
		);
	}
}