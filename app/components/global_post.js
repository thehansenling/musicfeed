import React from 'react';
import StandardHeader from './standard_header.js'
import CommentSection from './comments.js'
import utils from './utils.js'

class GlobalPostContent extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.album_songs = []
		this.likes_score = this.props.data.likes - props.data.dislikes;
		this.likeRef = React.createRef();
		this.dislikeRef = React.createRef();
		//this.like_state = -1
		this.up_image = "/small_up.png"
		this.down_image = "/small_down.png"
	}

	renderiframe(iframe) {
		return {
			__html: iframe
		};
	}

	generateAlbumSongs()
	{
		//for (key of Object.keys(JSON.parse(data[0].data)))
		for (var song of Object.keys(JSON.parse(this.props.data.data)))
		{
			this.album_songs.push(<div key = {JSON.parse(this.props.data.data)[song]} style = {{padding:'0px'}}> {song + "."} <a href = {"/post/" + this.props.data.artist + "/" + JSON.parse(this.props.data.data)[song]}> {JSON.parse(this.props.data.data)[song]} </a></div>)
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
	    fetch("/global_like", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id: this.props.data.post_id,})})
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
	    	//that.forceUpdate();
	 	})	
    	if (this.props.like_state == 1)
    	{
       		this.likes_score -= 1;
    		// this.likeRef.current.style = 'black'
    		// this.dislikeRef.current.style.color = 'black'
    		this.props.like_state = -1;
    		this.up_image = "/small_up.png"
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
    		// this.likeRef.current.style = 'blue'
    		// this.dislikeRef.current.style.color = 'black'
       		this.up_image = "/small_up_on.png"
    		this.down_image = "/small_down.png"
    		this.props.like_state = 1;
    	}
    	this.forceUpdate()

	}

	dislikeClicked()
	{
		if (!utils.checkLoggedIn())
		{
			alert("MUST BE LOGGED IN")
			return;
		}
		var that = this;
	    fetch("/global_dislike", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id: this.props.data.post_id,})})
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
	    	//that.forceUpdate();
	 	})	
    	if (this.props.like_state == 0)
    	{
    		// this.likeRef.current.style = 'black'
    		// this.dislikeRef.current.style.color = 'black'	 
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
    		// this.likeRef.current.style = 'black'
    		// this.dislikeRef.current.style.color = 'red'
       		this.down_image = "/small_down_on.png"
    		this.up_image = "/small_up.png"
    		this.props.like_state = 0;

    	}
    	this.forceUpdate();
	}


	render()
	{

		var artist_names = []
		this.props.data.artist.split('^').map((item, i) => {
			artist_names.push(<a key = {i} href ={"/artist/" + item} > {item} </a>);
			artist_names.push(',')
		})
		artist_names = artist_names.slice(0, artist_names.length-1)

		var song = <div> {this.props.data.song + " by "} {artist_names} </div>
		if (this.props.data.type == 1)
		{
			song = ""
			this.generateAlbumSongs();
		}



		var like_style = {color:'black'}
		var dislike_style = {color:'black'}
		if (this.props.like_state == 1)
		{
			like_style.color = 'blue'
			dislike_style.color = 'black'
		}
		else if (this.props.like_state == 0)
		{
			like_style.color = 'black'
			dislike_style.color = 'red'
		}

			// <div>
			// 	<div style={{position:'relative', top:'100px', paddingBottom:'100px', height: 'auto', minHeight: '550px'}}>
			// 		<div style={{position:'relative',float:'left', top:'0px', paddingRight:'20px'}} dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}>
			// 		</div>
			// 		<div style={{left:'10%', top:'20%'}}>

			// 			<div>
			// 				{song}
			// 				<div> Album: {this.props.data.album} </div>
			// 				<div> Released on: {this.props.data.release_date} </div>
			// 				{this.album_songs}
			// 			</div>

			// 		</div>
			// 	</div>
			// 	<br/>
			// 	<br/>
			// 	<br/>
			// 	<br/>
			// 	<div>
			// 		<div  className="likes" id = {this.props.data.id} >Likes: {this.likes_score} </div>
			// 		<button ref = {this.likeRef} onClick = {this.likeClicked.bind(this)} type="button" className = "like" id = {this.props.data.id} style = {like_style}>Like</button>
			// 		<button ref = {this.dislikeRef} onClick = {this.dislikeClicked.bind(this)} type="button" className = "unlike" id = {this.props.data.id} style = {dislike_style}>Hate</button>
			// 	</div>
			// 	<meta className = "comment_offset" content = "0" />
			// </div>


		return (
			<div style = {{background: 'white', position:'relative', top:'85px', paddingLeft:'10px', height: 'auto', minHeight: '550px', maxWidth:'1000px', paddingBottom:'50px', paddingRight:'10px', paddingTop:'10px', left:'5%', borderBottom: 'solid black 3px', borderRadius: '4px'}}>

				<div style = {{display:'inlineBlock'}}>
					<div style={{float:'left',position:'relative', top:'0px', paddingRight:'20px'}} dangerouslySetInnerHTML={this.renderiframe(this.props.data.embedded_content)}>
					</div>
					
					<div>
						{song}
						<div> Album: <a href = {"/album/" + this.props.data.artist + "/" + this.props.data.album}> {this.props.data.album} </a> </div>
						<div> Released on: {this.props.data.release_date} </div>
						{this.album_songs}
					</div>

				</div>
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


				<meta className = "comment_offset" content = "0" />
			</div>


		);
	}
}

class MiniPost extends React.Component
{
	constructor(props)
	{
		super(props)
		if (this.props.num_comments == undefined)
		{
			this.props.num_comments = 0;
		}
	}

	render()
	{
		var date = new Date(this.props.post.timestamp)
		return(
			<div style = {{width:'735px', backgroundColor:'white', borderRadius:'7px', border: '1px solid #F1F1F1'}}>
				<div style = {{display:'flex', flexDirection:'row', paddingLeft:'10px', paddingTop:'10px'}}>
					<div style = {{display:'flex', flexDirection:'row'}}>
						<div style = {{backgroundColor:this.props.user.profile_picture, borderRadius:'50%', height:'48px', width:'48px'}}>
						</div>
						<div style = {{paddingLeft:'10px', borderRight:'1px solid #F1F1F1', paddingRight:'20px'}}>
							<div style = {{fontSize:'1.1em', fontWeight:'bold'}}>
								<a href = {"/user/" + this.props.user.username}>{this.props.user.username}</a>
							</div>
							<div style = {{fontSize:'.8em'}}>
								{utils.monthNames[parseInt(date.getMonth())]+ " " + date.getDate() + ", " + date.getFullYear()}
							</div>
						</div>
						<div style = {{paddingTop:'10px', paddingLeft:'32px', fontWeight:'bold', fontSize:'1.2em', width:'400px'}}>
							<a href = {"/user/" + this.props.post.username + "/" + this.props.post.post_id}>{this.props.post.title}</a>
						</div>
						<div style = {{paddingTop:'10px', display:'flex', flexDirection:'row'}}>
							<svg width="14" height="24" viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg" color = 'blue'>
							<path d="M8.70711 0.987356C8.31658 0.596832 7.68342 0.596832 7.29289 0.987356L0.928931 7.35132C0.538407 7.74184 0.538407 8.37501 0.928931 8.76553C1.31946 9.15606 1.95262 9.15606 2.34315 8.76553L8 3.10868L13.6569 8.76553C14.0474 9.15606 14.6805 9.15606 15.0711 8.76553C15.4616 8.37501 15.4616 7.74184 15.0711 7.35132L8.70711 0.987356ZM9 26.3126L9 1.69446L7 1.69446L7 26.3126L9 26.3126Z" fill='black'/>
							</svg>
							<div style = {{minWidth:'30px', height:'30px', verticalAlign: 'middle', textAlign: 'center', fontSize: '16px', fontWeight:'bold'}}><a href = {"/user/" + this.props.post.username + "/" + this.props.post.post_id + "/likes"} >{this.props.post.likes - this.props.post.dislikes} </a></div>

							<svg width="14" height="24" viewBox="0 0 16 27" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.29289 26.0197C7.68342 26.4102 8.31658 26.4102 8.70711 26.0197L15.0711 19.6557C15.4616 19.2652 15.4616 18.632 15.0711 18.2415C14.6805 17.851 14.0474 17.851 13.6569 18.2415L8 23.8984L2.34315 18.2415C1.95262 17.851 1.31946 17.851 0.928932 18.2415C0.538408 18.632 0.538408 19.2652 0.928932 19.6557L7.29289 26.0197ZM7 0.694489L7 25.3126H9L9 0.694489L7 0.694489Z" fill='black'/>
							</svg>
							<div style = {{paddingLeft:'10px'}}><img src="/speech_bubble.png" width="30" height="26" alt=""/></div>
							<div style = {{width:'30px', height:'30px', verticalAlign: 'middle', textAlign: 'center', fontSize: '16px', fontWeight:'bold'}}> <a href = {"/user/" + this.props.post.username + "/" + this.props.post.post_id}> {this.props.num_comments} </a></div>
						</div>
					</div>
				</div>
				<div style = {{paddingLeft:'16px', paddingTop:'8px'}}>
					{this.props.post.content}
				</div>
			</div>
		)
	}
}

class GlobalInfo extends React.Component
{
	constructor(props)
	{
		super(props)
		this.state = {posts: []}
		this.offset = 0;
	}

	componentDidMount() 
	{
	    window.addEventListener('scroll', this.handleScroll.bind(this));

		let current_posts = this.state.posts
		for (var post of this.props.posts)
		{
			current_posts.push(<MiniPost user = {this.props.user_profiles[post.username]} post = {post} num_comments = {this.props.num_comments[post.post_id]}/>)
		}
		this.offset += current_posts.length
		this.setState({posts: current_posts});
	}

	addMiniPosts(posts, user_profiles)
	{

		
	}

	handleScroll() {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loading_posts_semaphor) 
		{
			var that = this
			this.loading_posts_semaphor = true
		    fetch("/load_user_posts", {
		        method: "POST",
		        headers: {
		        	'Accept': 'application/json',
		        	'Authorization': 'Basic',
		        	'Content-Type': 'application/json',
		        },
		        body: JSON.stringify({artist: that.props.global_post.artist,
		        					  album: that.props.global_post.album,
		        				      song: that.props.global_post.song,
		        				  	  offset: that.offset})})
		    .then(function(response) { return response.json();})
		    .then(function (data) { 
		    	that.offset += data.posts.length;
		    	//that.postsRef.current.addPosts(data.songs, data.likes, data.num_comments, data.num_posts, data.user_profiles)
				let current_posts = that.state.posts
				for (var post of data.posts)
				{
					current_posts.push(<MiniPost user = {data.user_profiles[post.username]} post = {post} num_comments = {data.num_comments[post.post_id]}/>)
				}
				that.setState({posts: current_posts});
				that.loading_posts_semaphor = false;
		 	})
		}
	}
	render()
	{
		return(
			<div>
				{this.state.posts}
			</div>)
	}
}

export default class GlobalPost extends React.Component
{
	constructor(props)
	{
		super(props);
	}
					// <GlobalPostContent data = {this.props.data.global_post} like_state = {this.props.data.like_state}/>
					// <CommentSection comments = {this.props.data.comments} comment_votes = {this.props.data.comment_votes} post_id = {this.props.data.global_post.post_id} posts = {this.props.data.user_posts} global_post = {this.props.data.global_post} />
							// <div>
							// 	<button className = "grayButton" style = {{height:'50px', width:'120px', fontSize:'1.2em'}}> Create Post </button>
							// </div>
	render()
	{
		if (this.props.data.global_post == undefined)
		{
			return(<div> Content Not Yet Posted </div>)
		}
		var date = new Date(this.props.data.global_post.timestamp)
		var content_name = this.props.data.global_post.song
		var album_div = <div style = {{fontSize:'1.1em'}}>
							{"Album: "}
							<a href = {"/album/" + this.props.data.global_post.artist + "/" + this.props.data.global_post.album}> {this.props.data.global_post.album} </a>
						</div>

		if (this.props.data.global_post.type == 1)
		{
			content_name = this.props.data.global_post.album
			album_div = ""
		}

		return (
			<div style = {{width:'735px', margin:'0px auto', paddingTop:'50px'}}>

				<div style = {{width:'735px', height:'400px', background:'white', border:'1px solid #F1F1F1', borderRadius:'7px', display:'flex', flexDirection:'row'}}>

					<div style = {{paddingTop:'10px', paddingLeft:'10px'}} dangerouslySetInnerHTML={utils.renderiframe(this.props.data.global_post.embedded_content)}>
					</div>

					<div style = {{justifyContent:'center', display:'flex', flexDirection:'column', paddingLeft:'20px'}}>
						<div style = {{fontSize:'1.4em', fontWeight:'bold', display:'flex', flexDirection:'row'}}>
							<div style = {{fontWeight:'bold'}}>{content_name}</div>
							<div style = {{paddingLeft:"8px", paddingRight:"8px", fontWeight:'bold'}}> by </div>  
							<a href = {"/artist/" + this.props.data.global_post.artist}>{this.props.data.global_post.artist}</a>
						</div>
						{album_div}
						<div style = {{fontSize:'1.1em'}}>
							{"Release Date: " + utils.monthNames[parseInt(date.getMonth())]+ " " + date.getDate() + ", " + date.getFullYear()}
						</div>
						<div style = {{display:'flex', flexDirection:'row'}}>
							<div style = {{}}>
								<div style = {{fontSize:'1.2em', fontWeight:'normal'}}> Likes</div>
								<div style = {{fontWeight:'bold', fontSize:'1.2em'}}>{this.props.data.likes}</div>
							</div>
							<div style = {{paddingLeft:'20px'}}>
								<div style = {{fontSize:'1.2em', fontWeight:'normal'}}> Posts</div>
								<div style = {{fontWeight:'bold', fontSize:'1.2em'}}>{this.props.data.num_posts}</div>
							</div>
						</div>
					</div>
				</div>
				<div style = {{fontWeight:'bold', fontSize:'1.5em', paddingTop:'20px'}}>
					Top User Posts
				</div>
				<div style = {{paddingTop:'20px', paddingBottom:'20px'}}>
					<GlobalInfo posts = {this.props.data.user_posts} global_post = {this.props.data.global_post} user_profiles = {this.props.data.user_profiles} num_comments = {this.props.data.num_comments}/>
				</div>
			</div>
		);
	}
}