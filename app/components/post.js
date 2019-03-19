import React from 'react';
import utils from './utils.js'

class Post extends React.Component 
{
	constructor(props) 
	{
		super(props);
		this.likes_score = this.props.song.likes - props.song.dislikes;
		//this.likeRef = React.createRef();
		//this.dislikeRef = React.createRef();
		this.up_image = "/small_up.png"
		this.down_image = "/small_down.png"
		this.contentRef = React.createRef();
		this.ellipsis = <div></div>
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		}
	}

	likeClicked()
	{
		
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}

		var that = this;
		var id = that.props.song.post_id;
		if (id == undefined)
		{
			id = that.props.song.id;
		}

		var post_url = "/like"
		if (that.props.song.username == undefined)
		{
			post_url = "/global_like"
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
    		//this.likeRef.current.style = 'black'
    		//this.dislikeRef.current.style.color = 'black'
    		this.up_image = "/small_up.png"
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
    		//this.likeRef.current.style = 'blue'
    		//this.dislikeRef.current.style.color = 'black'
    		this.up_image = "/small_up_on.png"
    		this.down_image = "/small_down.png"
    		this.props.like_state = 1;
    	}

    	this.forceUpdate();
	}

	dislikeClicked()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		var that = this;
		var id = that.props.song.post_id;
		if (id == undefined)
		{
			id = that.props.song.id;
		}

		var post_url = "/dislike"
		if (that.props.song.username == undefined)
		{
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
    		//this.likeRef.current.style = 'black'
    		//this.dislikeRef.current.style.color = 'black'	 
    		this.down_image = "/small_down.png"
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
    		//this.likeRef.current.style = 'black'
    		//this.dislikeRef.current.style.color = 'red'
    		this.down_image = "/small_down_on.png"
    		this.up_image = "/small_up.png"
    		this.props.like_state = 0;

    	}
    	this.forceUpdate();
	}

	componentDidMount() {
		console.log("CONTENT ISH")
		console.log(this.contentRef)
		console.log(this.contentRef.current)
		console.log(this.contentRef.current.offsetHeight)
		console.log(this.contentRef.offsetHeight)
		console.log(this.contentRef.current.height)
		if (this.contentRef.current.offsetHeight > 390)
		{
			var content_url = "/post/" + this.props.song.artist + "/" + this.props.song.song;

			if (this.props.song.song == "NO_SONG_ALBUM_ONLY")
			{
				content_url = "/album/" + this.props.song.artist + "/" + this.props.song.album;
			}


			this.ellipsis = <div style = {{paddingLeft:'580px', fontSize:'22pt'}}>
			<a href = {content_url}> ... </a>
			</div>
			this.forceUpdate();

		}
	}

	render()
	{
		var date = new Date(this.props.song.timestamp)
		var post_title = <h1 style= {{position:'relative'}}><a href = {"/user/" + this.props.song.username + "/" + this.props.song.id} > {this.props.song.title}</a></h1>;
		var poster_username = '';//this.props.song.artist;
		var poster_username_url = '';//"/artist/" + this.props.song.artist;

		var artist_name = this.props.song.artist;
		var artist_url = "/artist/" + this.props.song.artist;

		var content_div = []


		var content = <h2 style={{position:'relative'}}>{content_div}</h2>

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

			this.props.song.content.split('\n').map((item, i) => {
				if (item == '')
				{
					content_div.push(<br/>)
				}
				else
				{
					content_div.push(<p key={i}>{item}</p>);
				}
			})
		}

		var like_style = {color:'black'}
		var dislike_style = {color:'black'}
		if (this.props.like_state == 1)
		{
			like_style.color = 'blue';
			this.up_image = "/small_up_on.png"
		}
		else if (this.props.like_state == 0)
		{
			dislike_style.color = 'red';
			this.down_image = "/small_down_on.png"
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


		<div key = {this.props.song.post_id} style = {{border: '1px solid #BABABA', borderRadius: '4px', width:'980px', background:'white'}}>
			<div style=  {{float:'left', width:'300px', paddingLeft:'10px', paddingTop:'10px'}}>
				<div style = {{float:'left', fontFamily:'Playfair Display'}}> <a href ={poster_username_url} > {poster_username} </a></div>
				<div style = {{float:'right', paddingRight:'10px'}}>{(parseInt(date.getMonth()) + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</div>
				<div style = {{clear:'both'}}><a href ={artist_url} > {artist_name} </a></div>
				<div> <a href = {content_url} >{content_name} </a></div>
			</div>
				<div style = {{float:'left', paddingLeft: '180px', paddingTop:'8px'}}>{post_title}</div>
			<div style = {{clear:'both'}}>
				<div style = {{float:'left', paddingLeft: '10px', paddingTop:'3px', fontFamily:'Playfair Display'}}><span dangerouslySetInnerHTML={this.renderiframe(this.props.song.embedded_content)}></span></div>
				
				<div  style = {{fontSize:'11pt', paddingLeft: '10px', paddingTop:'5px', height: '390px', width:'650px', fontSize: '2em', overflow:'hidden', textOverflow:'ellipsis'}}> 
					<div ref = {this.contentRef}>
						{content_div}
					</div>
				</div>
				{this.ellipsis}
				<div style = {{clear:'both', height:'35px'}}>
					<div style = {{float:'left', width:'15px', height:'30px'}}></div>
					<div style = {{float:'left'}}><img onClick = {this.likeClicked.bind(this)} src={this.up_image} width="30" height="30" alt=""/></div>
					<div style = {{width:'60px', height:'30px', float:'left', verticalAlign: 'middle', textAlign: 'center', width:'60px', position: 'relative', top: '0px', fontSize: '21px'}}>{this.likes_score}</div>
					<div style = {{float:'left'}}><img onClick = {this.dislikeClicked.bind(this)} src={this.down_image} width="30" height="30" alt=""/></div>
					<div style = {{float:'left', width:'30px', height:'30px', borderRight: '1px solid black'}}></div>
					<div style = {{float:'left', width:'30px', height:'30px'}}></div>
					<div style = {{float:'left'}}><img src="/small_comment.png" width="30" height="30" alt=""/></div>
					<div style = {{width:'60px', height:'30px', float:'left', verticalAlign: 'middle', textAlign: 'center', width:'80px', position: 'relative', top: '0px', fontSize: '21px'}}>{this.props.num_comments}</div>
				</div>
			</div>
		</div>

 		// <div key = {this.props.song.post_id} style={{position:'relative', height:'480px',borderBottom: '4px solid gray',padding:'5px'}}>
 		// 	<div style = {{display: 'flex',flexDirection:'row'}}>
	 	// 		<span style={{width:'600px'}}>
	 	// 			{post_title}
	 	// 			<div style = {{display: 'flex',flexDirection:'row'}}>
	 				
	 	// 			<h3> <a href = 
	 	// 					{content_url}  > {content_name} 
	 	// 				</a>
		 // 				 {by_text}
		 // 				<a href ={poster_username_url} > {poster_username} </a> {at_text}
		 // 				{" " + (parseInt(date.getMonth()) + 1) + "/" + date.getDate() + "/" + date.getFullYear()} 
	 	// 			</h3>
	 	// 			</div>
	 	// 				{content}
	 	// 		</span>
	 	// 		<span dangerouslySetInnerHTML={this.renderiframe(this.props.song.embedded_content)}>
	 	// 		</span>
 		// 	</div>
			// <div className= "like_section">
			// 	{likes_section}
			// </div>
			// <div className= "comment_section" id = {this.props.song.id} >
			// 	{comment_section}
			// 	Comments: {this.props.num_comments}
			// </div>
 		// </div>

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
				like_state = like.like_state;
			}
		}
		for (var num_comments of this.props.num_comments)
		{
			
			if (song.post_id == num_comments.post_id)
			{
				current_num_comments = num_comments.count	
				break;		
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
				{this.posts.map((post) => {return <div> {post} <br/></div>})}
			</div>
		);
	}
}