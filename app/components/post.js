import React from 'react';
import utils from './utils.js'
import tag_utils from './tag_utils.js'

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

class Post extends React.Component 
{
	constructor(props) 
	{
		super(props);
		this.likes_score = this.props.song.likes - props.song.dislikes;
		//this.likeRef = React.createRef();
		//this.dislikeRef = React.createRef();
		this.up_color = "#2F3846"
		this.down_color = "#2F3846"
		this.contentRef = React.createRef();
		this.ellipsis = <div></div>
		this.bump_button = <button style = {{color:'black'}} onClick = {this.bumpClicked.bind(this)}> Bump </button>
		if (this.props.bump)
		{
			this.bump_button = <button style = {{color:'black', backgroundColor: 'gray'}} onClick = {this.bumpClicked.bind(this)} disabled> Bumped </button>
		}

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
	        body: JSON.stringify({user: that.props.song.username, id: id, name:this.props.song.title})})
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
    		this.up_color = "#2F3846"
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
    		this.up_color = "#1485cc"
    		this.down_color = "#2F3846"
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
	        body: JSON.stringify({user: that.props.song.username, id: id, name: that.props.song.title})})
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
    		this.down_color = "#2F3846"
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
    		this.down_color = "#dd3d3d"
    		this.up_color = "#2F3846"
    		this.props.like_state = 0;

    	}
    	this.forceUpdate();
	}

	componentDidMount() {
		if (this.contentRef.current.offsetHeight > 390)
		{
			var content_url = "/user/" + this.props.song.username+ "/" + this.props.song.post_id

			// if (this.props.song.song == "NO_SONG_ALBUM_ONLY")
			// {
			// 	content_url = "/album/" + this.props.song.artist + "/" + this.props.song.album;
			// }


			this.ellipsis = <div style = {{}}>
			<a style = {{color:'#178275', fontSize:'14pt', fontWeight: 'bold'}}href = {content_url}> See More </a>
			</div>
			this.forceUpdate();

		}

	}

	bumpClicked()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		var that = this
	    fetch("/bump", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({post_id: this.props.song.post_id})})
	    .then(function(response) { return response.json();})
	    .then(function (data) { 
	    	if (data.success)
	    	{
	    		//change bump to bumped
	    		that.bump_button = <button style = {{color:'black', backgroundColor: 'gray'}} onClick = {that.bumpClicked.bind(this)} disabled> Bumped </button>
	    		that.forceUpdate()
	    	}
	    	else
	    	{
	    		//alert no bumps
	    		alert("YOU HAVE NO BUMPS AVAILABLE")
	    	}
	    })		
	}

	render()
	{
		var date = new Date(this.props.song.timestamp)
		var post_title = <h1 className = "post_title" style= {{position:'relative', fontWeight:'bold', fontSize:'24px'}}><a href = {"/user/" + this.props.song.username + "/" + this.props.song.id} > {this.props.song.title}</a></h1>;
		var poster_username = '';//this.props.song.artist;
		var poster_username_url = '';//"/artist/" + this.props.song.artist;

		var artist_name = this.props.song.artist;

		var artist_names = []
		this.props.song.artist.split('^').map((item, i) => {
			artist_names.push(<a key = {i} href ={"/artist/" + item} > {item} </a>);
			artist_names.push(',')
		})
		artist_names = artist_names.slice(0, artist_names.length-1)

		var artist_url = "/artist/" + this.props.song.artist;

		var content_div = []

		var content = <h2 style={{position:'relative'}}>{content_div}</h2>

		var by_text = " by"
		var at_text = " posted at "

		var post_id = this.props.song.post_id;

		//not 'global' post
		if (this.props.song.username != undefined)
		{
			post_id = this.props.song.id;
			//post_title = "";
			by_text = " posted by " 
			at_text = " at "
			poster_username = this.props.song.username;
			poster_username_url = "/user/" + this.props.song.username;

			content_div = tag_utils.formatContent(this.props.song.content, this.props.song.tags)
		}

		var like_style = {color:'black'}
		var dislike_style = {color:'black'}
		if (this.props.like_state == 1)
		{
			like_style.color = 'blue';
			this.up_color = "#1485cc"
		}
		else if (this.props.like_state == 0)
		{
			dislike_style.color = 'red';
			this.down_color = "#dd3d3d"
		}

		var likes_section = <div>
			<div  className="likes" id = {post_id} >Likes: {this.likes_score} </div>
			<button ref = {this.likeRef} onClick = {this.likeClicked.bind(this)} type="button" className = "like" id = {post_id} style = {like_style}>Like</button>
			<button ref = {this.dislikeRef} onClick = {this.dislikeClicked.bind(this)} type="button" className = "unlike" id = {post_id} style = {dislike_style}>Hate</button>
			</div>
		var comment_section = <div style = {{fontSize:'24px'}} className= "comment_section" id = {post_id} />
		var content_url = "/post/" + this.props.song.artist + "/" + this.props.song.song;
		var content_name = this.props.song.song;

		if (this.props.song.song == "NO_SONG_ALBUM_ONLY")
		{
			content_url = "/album/" + this.props.song.artist + "/" + this.props.song.album;
			content_name = this.props.song.album;
		}
		var leftpadding = '0px'
		var content_section = <div  style = {{maxHeight:'450px', paddingTop:'5px', lineHeight:'27px', width:'380px', fontSize:'20px', overflow:'hidden', textOverflow:'ellipsis'}}> 
					<div ref = {this.contentRef}>
						{content_div}
					</div>
				</div>
		var date_float = 'right'
		if (this.props.song.username == undefined)
		{
			leftpadding = '340px'
			content_section = <div ref = {this.contentRef}></div>
			date_float = 'left'
		}

		return(

		<div key = {this.props.song.post_id} style = {{border: '1px solid #F1F1F1', borderRadius: '7px', width:'735px', background:'white', minHeight:'513px', position:'relative', top:'20px'}}>
			<div style = {{display:'flex', flexDirection:'row'}}>
				<div style = {{width:'320px', paddingTop:'30px', paddingLeft:'10px', borderRight:'1px solid rgba(0, 0, 0, 0.09)', borderRadius:'7px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px'}}>
					<div style = {{display:'flex', flexDirection:'row'}}>
						<div style = {{width:'65px', height:'65px', backgroundColor:this.props.user_profile, borderRadius:'50%'}}>
						</div>
						<div style = {{paddingLeft:'20px'}}>
							<div style = {{fontSize:'24px', fontWeight:'bold'}}> <a href ={poster_username_url} > {poster_username} </a></div>
							<div style = {{fontSize:'17px', paddingRight:'10px'}}>{ monthNames[parseInt(date.getMonth())]+ " " + date.getDate() + ", " + date.getFullYear()}</div>
						</div>
					</div>


					<div style = {{paddingTop:'30px'}}><span dangerouslySetInnerHTML={this.renderiframe(this.props.song.embedded_content)}></span>
					</div>
					<div style = {{width:'300px', height:'30px'}}> 
					</div>
					<div style = {{height:'35px', display:'flex', flexDirection:'row'}}>
						<div style = {{width:'15px', height:'30px'}}></div>
						<svg onClick = {this.likeClicked.bind(this)} width="14" height="24" viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg" color = 'blue'>
						<path d="M8.70711 0.987356C8.31658 0.596832 7.68342 0.596832 7.29289 0.987356L0.928931 7.35132C0.538407 7.74184 0.538407 8.37501 0.928931 8.76553C1.31946 9.15606 1.95262 9.15606 2.34315 8.76553L8 3.10868L13.6569 8.76553C14.0474 9.15606 14.6805 9.15606 15.0711 8.76553C15.4616 8.37501 15.4616 7.74184 15.0711 7.35132L8.70711 0.987356ZM9 26.3126L9 1.69446L7 1.69446L7 26.3126L9 26.3126Z" fill={this.up_color}/>
						</svg>
						<div style = {{minWidth:'30px', height:'30px', verticalAlign: 'middle', textAlign: 'center', position: 'relative', top: '0px', fontSize: '16px', fontWeight:'bold'}}><a href = {"/user/" + this.props.song.username + "/" + this.props.song.id + "/likes"} >{this.likes_score} </a></div>

						<svg onClick = {this.dislikeClicked.bind(this)} width="14" height="24" viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7.29289 26.0197C7.68342 26.4102 8.31658 26.4102 8.70711 26.0197L15.0711 19.6557C15.4616 19.2652 15.4616 18.632 15.0711 18.2415C14.6805 17.851 14.0474 17.851 13.6569 18.2415L8 23.8984L2.34315 18.2415C1.95262 17.851 1.31946 17.851 0.928932 18.2415C0.538408 18.632 0.538408 19.2652 0.928932 19.6557L7.29289 26.0197ZM7 0.694489L7 25.3126H9L9 0.694489L7 0.694489Z" fill={this.down_color}/>
						</svg>

						<div style = {{width:'10px', height:'30px', borderRight: '1px solid rgba(0, 0, 0, 0.09)'}}></div>
						<div style = {{width:'10px', height:'30px'}}></div>
						<div style = {{}}><img src="/speech_bubble.png" width="30" height="26" alt=""/></div>

						<div style = {{width:'30px', height:'30px', verticalAlign: 'middle', textAlign: 'center', position: 'relative', top: '0px', fontSize: '16px', fontWeight:'bold'}}> {this.props.num_comments} </div>
						<div  style = {{width:'30px', height:'30px', verticalAlign: 'middle', textAlign: 'center', position: 'relative', top: '0px', fontSize: '16px', fontWeight:'bold'}}>
							{this.bump_button}
						</div>
					</div>				
				</div>

				<div style = {{paddingTop:'30px', paddingLeft:'10px', paddingRight:'20px', width:'400px', fontSize:'20px'}}>
					{post_title}
					{content_section}
					{this.ellipsis}
				</div>
			</div>
		</div>

		// <div key = {this.props.song.post_id} style = {{border: '1px solid #F1F1F1', borderRadius: '7px', width:'980px', background:'white', minHeight:'513px'}}>
		// 	<div style = {{paddingLeft: leftpadding, display:'flex', flexDirection:'row'}}>
		// 	<div style=  {{width:'300px', paddingLeft:'10px', paddingTop:'10px'}}>
		// 		<div style = {{float:'left'}}> <a href ={poster_username_url} > {poster_username} </a></div>
		// 		<div style = {{float:date_float, paddingRight:'10px'}}>{(parseInt(date.getMonth()) + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</div>
		// 		<div style = {{clear:'both'}}>{artist_names}</div>
		// 		<div> <a href = {content_url} >{content_name} </a></div>
		// 	</div>
		// 	<div style = {{paddingTop:'8px', width:'680px', margin: '0px auto'}}>{post_title}</div>

		// 	</div>
		// 	<div style = {{clear:'both', paddingLeft:leftpadding}}>
		// 		<div style = {{float:'left', paddingLeft: '10px', paddingTop:'3px'}}><span dangerouslySetInnerHTML={this.renderiframe(this.props.song.embedded_content)}></span></div>
		// 		{content_section}

		// 		<div style = {{clear:'both', display:'flex', flexDirection:'row'}}>
					
		// 			<div style = {{clear:'both', height:'35px'}}>
		// 				<div style = {{float:'left', width:'15px', height:'30px'}}></div>
		// 				<div style = {{float:'left'}}><img onClick = {this.likeClicked.bind(this)} src={this.up_image} width="30" height="30" alt=""/></div>
		// 				<div style = {{width:'60px', height:'30px', float:'left', verticalAlign: 'middle', textAlign: 'center', width:'60px', position: 'relative', top: '0px', fontSize: '21px'}}><a href = {"/user/" + this.props.song.username + "/" + this.props.song.id + "/likes"} >{this.likes_score} </a></div>
		// 				<div style = {{float:'left'}}><img onClick = {this.dislikeClicked.bind(this)} src={this.down_image} width="30" height="30" alt=""/></div>
		// 				<div style = {{float:'left', width:'30px', height:'30px', borderRight: '1px solid black'}}></div>
		// 				<div style = {{float:'left', width:'30px', height:'30px'}}></div>
		// 				<div style = {{float:'left'}}><img src="/small_comment.png" width="30" height="30" alt=""/></div>
		// 				<div style = {{width:'60px', height:'30px', float:'left', verticalAlign: 'middle', textAlign: 'center', width:'80px', position: 'relative', top: '0px', fontSize: '21px'}}> {this.props.num_comments} </div>
		// 			</div>
		// 			{this.ellipsis}
		// 		</div>
		// 	</div>
		// </div>

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
		var post_bumped = false
		for (var bump of this.props.bumps)
		{
			if (song.post_id == bump.post_id)
			{
				post_bumped = true
			}
		}
		this.posts.push(<Post key={song.post_id} song={song} like_state = {like_state} num_comments = {current_num_comments} user_profile = {this.props.user_profiles[song.username]} bump = {post_bumped}/>);
	}

	addSongs()
	{
		for (var song of this.props.songs)
		{
			this.makePost(song);
		}
	}

	addPosts(songs, likes, all_num_comments, all_num_posts, all_user_profiles)
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
			if (song.username != undefined)
			{
				for (var num_comments of all_num_comments)
				{
					var id = num_comments.post_id
					if (id == song.post_id)
					{
						current_num_comments = num_comments.count;
						break;
					}
				}
			}
			else
			{
				for (var num_posts of all_num_posts)
				{
					var id = num_posts.post_id
					if (id == song.post_id)
					{
						current_num_comments = num_posts.count;
						break;
					}
				}			
			}
			var post_bumped = false
			for (var bump of this.props.bumps)
			{
				if (song.post_id == bump.post_id)
				{
					post_bumped = true
				}
			}
			var user_profile = all_user_profiles[song.username]
			this.posts.push(<Post key={song.post_id} song={song} like_state = {like_state} num_comments = {current_num_comments} user_profile = {user_profile} bump = {post_bumped}/>);
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
			<div style={{margin: '0 auto', position:'relative',width:'735px'}}>
				{this.posts.map((post) => {return <div> {post} <br/></div>})}
			</div>
		);
	}
}