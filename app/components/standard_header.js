var React = require('react');
var ReactDOM = require('react-dom')

function SortSearch(users, artists, songs, albums)
{
	var search_list = [];

	for (var key in users)
	{
		var user_display = users[key].username;
		var user_url = "user/" + users[key].username;
		search_list.push([user_display, user_url]);
 	}

 	for (var key in artists)
 	{
	 	var artist_display = artists[key].artist;
	 	var artist_url = "artist/" + artists[key].artist
	 	search_list.push([artist_display, artist_url]);
	}

	for (var key in songs)
	{
	 	var song_display = songs[key].song;
	 	var song_url = "post/" + songs[key].artist + "/" + songs[key].song;
	 	search_list.push([song_display, song_url]);
 	}

 	for (var key in albums)
 	{
	 	var album_display = albums[key].album;
	 	var album_url = "album/" + albums[key].artist + "/" + albums[key].album;
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
		console.log("RENDERING THING")
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

	    fetch("/about", {
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
				<p><label>Search:</label><input onChange={this.handleChange.bind(this)} type='text' name='country' className='search_bar'/></p>
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
	}



  render() {
    return (

<div>
<html lang='en'/>
	<head>
		<title>My Node Site</title>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>
		<link rel="stylesheet" href="/css/styles.css"/>
	    <link rel="stylesheet" href="/css/search.css"/>

	</head>
	<header>
		<nav className="navbar navbar-inverse" id = "reacttest" style = {{position:'fixed', backgroundColor: 'gray', width:'100%', zIndex:'10'}}>
			<a href="/" className="navbar-brand">My Site</a>
		    <div>
		        <div className="search_list" id = "MyDropdown" style = {{position:'absolute', display:'block', overflow: 'auto'}}>
		        <SearchList />
		        </div>
		    </div>
		    <ul className="nav navbar-nav">
		        <li><a href="/register">Register</a></li>
		        <li><a href="/login">Login</a></li>
		    </ul>
			<ul className="nav navbar-nav">
				<li><a href="/">Home</a></li>
				<li><a href="/about">About</a></li>
				<li><a href="/contact">Contact</a></li>
			</ul>
		</nav>

	</header>
</div>

	);
}
}

