var React = require('react');
var ReactDOM = require('react-dom')

function SortSearch(users, artists, songs, albums)
{
	var search_list = [];

	for (var key in users)
	{
		var user_display = users[key].username;
		var user_url = "/user/" + users[key].username;
		search_list.push([user_display, user_url]);
 	}

 	for (var key in artists)
 	{
	 	var artist_display = artists[key].artist;
	 	var artist_url = "/artist/" + artists[key].artist
	 	search_list.push([artist_display, artist_url]);
	}

	for (var key in songs)
	{
	 	var song_display = songs[key].song;
	 	var song_url = "/post/" + songs[key].artist + "/" + songs[key].song;
	 	search_list.push([song_display, song_url]);
 	}

 	for (var key in albums)
 	{
	 	var album_display = albums[key].album;
	 	var album_url = "/album/" + albums[key].artist + "/" + albums[key].album;
	 	search_list.push([album_display, album_url]);
 	}

    search_list.sort(function(a, b){
    	if (a[0] > b[0])
        {
        	return 1;
        }
        return -1;
    });
    return search_list;
}

class SearchItem extends React.Component {

	constructor(props) {
		super(props);
		this.item_list = [];
	}

	clearItems()
	{
		this.item_list = [];
		this.forceUpdate();
	}

	renderItem(item, url)
	{
		this.item_list.push(<div><a href = {url}> {item} </a></div>);
		this.forceUpdate();
	}

	render ()
	{
		return(
			<div className="SearchItems">
				{this.item_list}
			</div>
		);
	}
};

class SearchList extends React.Component {
	
	constructor(props)
	{
		super(props);
		this.search_list = React.createRef();
	}

	handleChange()
	{
		var input = event.target.value;
		var that = this;

	    fetch("/search", {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({type: "search", text: input}),
	    }).then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	var search_results = SortSearch(data.users, data.artists, data.songs, data.albums);
	    	that.search_list.current.clearItems();
	    	for (var key in search_results)
	        {
	        	that.search_list.current.renderItem(search_results[key][0], search_results[key][1]);
	        }
	 	})	
	}

	render ()
	{
		return(
			<div>
				<input onChange={this.handleChange.bind(this)} placeholder = "Search" type='text' name='country' className='search_bar'/>
				<SearchItem ref={this.search_list}/>
			</div>
		);

	}
}

export default class StandardHeader extends React.Component {

	constructor (props)
	{
		super(props);
		this.search_list = React.createRef();
		this.dropdownRef = React.createRef();
		this.notificationsRef = React.createRef();
  		this.dropdown_content = []

	  	this.notification_div = ""
	  	this.dropdown_div = ""
	  	if (this.props.notifications != undefined && this.props.notifications.length > 0)
	  	{	
		  	for (var i = 0; i < this.props.notifications.length; ++i)
		  	{
		  		var comment_text = this.props.notifications[i].num_comments + ", comments"
		  		var likes_text = this.props.notifications[i].num_likes + " likes"
		  		if (this.props.notifications[i].num_comments == 0)
		  		{
		  			comment_text = ""
		  		}
		  		if (this.props.notifications[i].num_likes == 0)
		  		{
		  			likes_text = ""
		  			if (comment_text.length != 0)
		  			{
		  				comment_text = comment_text.substring(0, comment_text.indexOf(",")) + comment_text.substring(comment_text.indexOf(",") + 1, comment_text.length)
		  			}
		  		}
		  		this.dropdown_content.push(<div key = {this.props.notifications[i].post_id} id = {this.props.notifications[i].post_id} className = "dropdownelement" style = {{background:'white', border: '1px solid black'}}> 
		  			<a className = "dropdownelement" href = {"/user/" + this.props.notifications[i].username + "/" + this.props.notifications[i].post_id} >Your post {this.props.notifications[i].name} got {likes_text} {comment_text} </a>
		  			 <button key = {this.props.notifications[i].post_id} style = {{right:'0px', position:'absolute', height:'25px'}} className = "dropdownelement" onClick = {this.removeNotification.bind(this, this.props.notifications[i].post_id)}> X </button>
		  			</div>)
		  	}

		  	this.notification_div = <div className = "notifications" ref = {this.notificationsRef} onClick = {this.toggleNotifications.bind(this)} style = {{marginRight: '10px', fontWeight:'bold', fontSize:'14pt', minWidth:'30px', minHeight:'30px', textAlign:'center'}}> {this.props.notifications.length}</div>


	  	}
	}

	logoutClicked ()
	{
	    fetch('/logout', {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	    })
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	    	location.reload(true);
	 	})		
	}


	toggleNotifications()
	{
		if (this.dropdownRef.current.style.display == 'block')
		{
			this.closeNotifications()
		}
		else
		{
			this.showNotifications()
		}
	}

	showNotifications()
	{

		this.dropdownRef.current.style.display = 'block'
		this.forceUpdate();
	}

	closeNotifications()
	{
		this.dropdownRef.current.style.display = 'none'
		this.forceUpdate();
	}

	componentDidMount() 
	{
		window.addEventListener('mousedown', this.handleClickOutside.bind(this));
	}

	componentWillUnmount() 
	{
		window.removeEventListener('mousedown', this.handleClickOutside.bind(this));
	}

	handleClickOutside(event) 
	{
		if (event.type == 'contextmenu')
		{ 
			return
		}
		if (event.target.className != "dropdown" && event.target.className != "notifications" && event.target.className != "dropdownelement") {
			this.closeNotifications()
		}
		else
		{
		}
	}

	removeNotification(id)
	{
		for (var i = 0; i < this.dropdown_content.length; ++i)
		{
			if (this.dropdown_content[i].props.id == id)
			{
				this.dropdown_content.splice(i, 1)
				this.notification_div = <div className = "notifications" ref = {this.notificationsRef} onClick = {this.toggleNotifications.bind(this)} style = {{marginRight: '10px', fontWeight:'bold', fontSize:'14pt', minWidth:'30px', minHeight:'30px', textAlign:'center'}}> {this.notification_div.props.children[1] -1}</div>
				break
			}
		}
		if (this.dropdown_content.length == 0)
		{
			this.notification_div = ""
			this.closeNotifications();
		}

		this.forceUpdate()
	    fetch('/remove_notification', {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id: id,}),
	    })
	    .then(function(response) { return response.json();})
	    .then(function (data) {    	
	 	})		
	}

  render() {

  	

	this.dropdown_div = <div className = "dropdown" ref = {this.dropdownRef} style = {{ width:'400px', minHeight:'10px', position: "fixed", right:'220px', top:'50px', background:'white', display:'none', fontWeight:'normal', fontSize:'12pt', zIndex:'8'}}>{this.dropdown_content}</div>


  	var user_login = <div style = {{marginRight: '10px'}}>
				        <a style = {{marginRight: '10px'}} href = {"/user/" + this.props.username}> {this.props.username} </a>
  			   		</div>
  	var logout_register = <div style = {{marginRight: '10px'}}><a href="/" onClick = {this.logoutClicked.bind(this)}>Logout</a></div>
  	if (this.props.username == undefined)
  	{
	  	user_login = <div style = {{marginRight: '10px'}}>
			        <a href="/register" >Register</a>			        
					</div>
		logout_register = <div style = {{marginRight: '10px'}}><a href="/login">Login</a></div>
  	}


    return (

	<div className = "StandardHeader" >
		<head>
			<title>My Node Site</title>
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>

		</head>
		<header>
			<div className = "id" headercontainer = "reacttest" style = {{top:'0px', left:'0px', position:'fixed', height:'60px', backgroundColor: '#178275', width:'100%', zIndex:'5'}}>
				<div className = "home" style = {{position:'absolute',top:'15px', left:'10px'}}><a href="/" >Home</a></div>
			    <div className = "searchbarcontainer" style = {{position:'absolute',top:'15px', left:'210px'}}>
			        <div className="search_list" style = {{overflow: 'auto'}}>
			        <SearchList />
			        </div>
			    </div>
			    <div className = "headerlinks" style = {{display:'flex', flexDirection:'row', position:'absolute', right:'0px', marginRight: '10px', top:'15px'}}>
					{this.notification_div}
					{this.dropdown_div}
				    <div className = "userlogin" style = {{marginRight: '10px'}}>
				    	{user_login}
				    </div >
				    <div  className = "logoutregister" style = {{marginRight: '10px'}}>
				    	{logout_register}
				    </div >
					
				    <div className = "random" >
				    	
				    	<a style ={{marginRight: '10px'}}href="/random">Random</a>
			    	</div>
			    	<div className = "about" >
						<a style ={{marginRight: '10px'}}href="/about">About</a>
					</div>
					<div className = "contact" >
						<a href="/contact">Contact</a>
					</div>
				</div>
			</div>

		</header>
	</div>

	);
}
}

