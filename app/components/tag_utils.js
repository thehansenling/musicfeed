var utils = require('./utils.js')
var React = require('react');
module.exports = 
{
	getTags : function (obj)
	{
		obj.tagged = false
		var remaining_tags = []
		for (var i = 0; i < obj.potential_tags.length; ++i)
		{
			if (obj.contentRef.current.selectionEnd == obj.potential_tags[i][2] + 1 && (obj.contentRef.current.value[obj.contentRef.current.selectionEnd] == ' ' 
				|| obj.contentRef.current.value.length == obj.contentRef.current.selectionEnd || obj.contentRef.current.value[obj.contentRef.current.selectionEnd] == '\n' || 
				obj.contentRef.current.value[obj.contentRef.current.selectionEnd] == '\t'))
			{
			}
			else if (obj.contentRef.current.selectionEnd == obj.potential_tags[i][2] + 2 && (obj.contentRef.current.value[obj.contentRef.current.selectionEnd - 1] == ' ' || 
					obj.contentRef.current.value[obj.contentRef.current.selectionEnd] == '\n' || obj.contentRef.current.value[obj.contentRef.current.selectionEnd] == '\t'))
			{
				
			}
			else if (obj.contentRef.current.selectionEnd > obj.potential_tags[i][1] - (obj.lastContentSize - obj.contentRef.current.value.length) && obj.contentRef.current.selectionEnd <= obj.potential_tags[i][2] + 2)
			{
				continue;
			}					
			else 
			{
				if (obj.contentRef.current.selectionEnd <= obj.potential_tags[i][1] + 1)
				{
					obj.potential_tags[i][1] -= obj.lastContentSize - obj.contentRef.current.value.length;
					obj.potential_tags[i][2] -= obj.lastContentSize - obj.contentRef.current.value.length;
				}				
			}
			remaining_tags.push(obj.potential_tags[i])
		}
		obj.potential_tags = remaining_tags

		//goals - Get tag up to selection, set tagFlag, determine what kind of tag
		var current_index = obj.contentRef.current.selectionEnd - 1
		var last_dash = -1
		obj.currentTag = ""
		obj.artistSearch = false
		obj.artistFlag = false
		obj.tagFlag = false;
		if (obj.contentRef.current.value[current_index] != ' ')
		{
			while (current_index < obj.contentRef.current.value.length)
			{
				if (obj.contentRef.current.value[current_index] == ' ' ||
					obj.contentRef.current.value[current_index] == '\n' ||
					obj.contentRef.current.value[current_index] == '\t' ||
					obj.contentRef.current.value[current_index] == '@' ||
					obj.contentRef.current.value[current_index] == '#')
				{
					break;
				}
				++current_index
			}
			--current_index
		}
		else
		{
			//if char is ' ', could have a new tag when typing in the middle of text
			current_index = obj.contentRef.current.selectionEnd - 2
			//trust insertTag to not add duplicates
		}
		var tag_end = current_index
		while (current_index >= 0)
		{
			if (obj.contentRef.current.value[current_index] == ' ' ||
				obj.contentRef.current.value[current_index] == '\n' ||
				obj.contentRef.current.value[current_index] == '\t')
			{
				obj.tagList = []
				obj.currentTag = ""
				break;
			}
			else if (obj.contentRef.current.value[current_index] == '#') 
			{
				if (last_dash != -1)
				{
					obj.artistSearch = true
				}
				else
				{
					obj.artistFlag = true
				}
				obj.tagFlag = true
				break;
			}
			else if (obj.contentRef.current.value[current_index] == '@') 
			{
				obj.tagFlag = true
				break;
			}
			else if (obj.contentRef.current.value[current_index] == '-')
			{
				last_dash = current_index
			}
			obj.currentTag = obj.contentRef.current.value[current_index] + obj.currentTag
			current_index--;
		}
		//Add tag
		if (obj.artistSearch)
		{
			var current_song = obj.currentTag.substring(obj.currentTag.indexOf('-') + 1, obj.currentTag.length)
			//check if song/album fully typed
			if (obj.songs_and_albums.length > 0 && obj.songs_and_albums[0].song != "NO_SONG_ALBUM_ONLY")
			{
				var alternative_song = utils.replaceAll(obj.songs_and_albums[0].song, " ", "_")
				if (obj.songs_and_albums.length > 0 && (obj.songs_and_albums[0].song.toLowerCase() == current_song.toLowerCase() || 
					alternative_song.toLowerCase() == current_song.toLowerCase()))
				{
					//this.potential_tags.push([this.songs_and_albums[0], current_index, this.contentRef.current.value.selectionEnd - 1] )
					obj.potential_tags = utils.insertTag(obj.potential_tags, [obj.songs_and_albums[0], current_index, obj.contentRef.current.value.selectionEnd - 1, 2])
					obj.tagged = false
				}				
			}
			else
			{
				var current_album = obj.currentTag.substring(obj.currentTag.indexOf('-') + 1, obj.currentTag.length)
				var alternative_album = obj.current_album
				if (obj.songs_and_albums.length > 0)
				{
					alternative_album = utils.replaceAll(current_album, " ", "_")
				}
				if (obj.songs_and_albums.length > 0 && (obj.songs_and_albums[0].album.toLowerCase() == current_album.toLowerCase() ||
					alternative_album.toLowerCase() == current_album.toLowerCase()))
				{
					obj.potential_tags = utils.insertTag(obj.potential_tags, [obj.songs_and_albums[0], current_index, obj.contentRef.current.value.selectionEnd - 1, 3])
					obj.tagged = false
				}
			}
		}
		else
		{
			//check if artist/user fully typed
			if (obj.artistFlag)
			{
				var alternative_artist = obj.currentTag
				if (obj.artists[0] != undefined)
				{
					alternative_artist = utils.replaceAll(obj.artists[0].artist, " ", "_")
				} 
				if (obj.artists.length > 0 && (obj.artists[0].artist.toLowerCase() == obj.currentTag.toLowerCase() || 
					alternative_artist.toLowerCase() == obj.currentTag.toLowerCase()))
				{
					obj.potential_tags = utils.insertTag(obj.potential_tags, [obj.artists[0], current_index, current_index + obj.currentTag.length, 1])
					obj.tagged = false
				}
			}
			else
			{
				if (obj.users.length > 0 && obj.users[0].username.toLowerCase() == obj.currentTag.toLowerCase())
				{
					obj.potential_tags = utils.insertTag(obj.potential_tags, [obj.users[0], current_index, current_index + obj.currentTag.length, 0])
					//this.potential_tags.push([this.users[0], current_index, current_index + this.currentTag.length])
					obj.tagged = false
				}		
			}					
		}

		if (!obj.tagged && obj.tagFlag)
		{
			//this.tagged not really necessary
			var alreadyTagFlag = false
			for (var i = 0; i < obj.potential_tags.length; ++i)
			{
				if (obj.potential_tags[i][1] == current_index)
				{
					alreadyTagFlag = true
					break;
				}
			}
			if (!alreadyTagFlag && obj.tagFlag)
			{
				var tag_label = 0;
				if (obj.artistSearch)
				{
					tag_label = 2
				}
				else if (obj.artistFlag)
				{
					tag_label = 1
				}
				obj.potential_tags.push([obj.currentTag, current_index, tag_end, tag_label])
			}
		}

		//adding to taglist section
		if (obj.artistSearch)
		{
			var artist = obj.contentRef.current.value.substring(current_index+1, last_dash)
			var song_album = obj.contentRef.current.value.substring(last_dash + 1, tag_end + 1)
			var that = obj;
			fetch("/post_tag_artist_search", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Authorization': 'Basic',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({artist: artist,
									tag: song_album, })})
				.then(function(response) { return response.json();})
				.then(function (data) { 
					that.tagList = [] 
					that.songs_and_albums = data.songs.concat(data.albums);
				    that.songs_and_albums.sort(function(a, b){
				    	if (a.song != "NO_SONG_ALBUM_ONLY" && b.song != "NO_SONG_ALBUM_ONLY")
				    	{
					    	if (a.song > b.song)
					        {
					        	return 1;
					        }
					        return -1;
				    	}
				    	else if (a.song != "NO_SONG_ALBUM_ONLY" && b.song == "NO_SONG_ALBUM_ONLY")
				    	{
					    	if (a.song > b.album)
					        {
					        	return 1;
					        }
					        return -1;
				    	}
				    	else if (a.song == "NO_SONG_ALBUM_ONLY" && b.song != "NO_SONG_ALBUM_ONLY")
				    	{
					    	if (a.album > b.song)
					        {
					        	return 1;
					        }
					        return -1;
				    	}
				    	else
				    	{
					    	if (a.album > b.album)
					        {
					        	return 1;
					        }
					        return -1;
				    	}
				    });				
					for (var tag of that.songs_and_albums)
					{
						if (tag.song == "NO_SONG_ALBUM_ONLY")
						{
							that.tagList.push(<div id = {that.tagList.length} className = "album" style = {{color:'purple'}} onClick = {that.selectTag.bind(that)}> {tag.album} </div>)
						}
						else
						{
							that.tagList.push(<div id = {that.tagList.length} className = "song" style = {{color:'blue'}} onClick = {that.selectTag.bind(that)}> {tag.song} </div>)
						}
					}
					that.forceUpdate()		
				})
		}
		else if (obj.artistFlag)
		{
			var that = obj;
			fetch("/post_tag_artist", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Authorization': 'Basic',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({tag: obj.currentTag, })})
				.then(function(response) { return response.json();})
				.then(function (data) { 
					that.tagList = [] 
					that.artists = data.artists;
				    that.artists.sort(function(a, b){
				    	if (a.artist > b.artist)
				        {
				        	return 1;
				        }
				        return -1;
				    });				
					for (var tag of that.artists)
					{
						that.tagList.push(<div id = {that.tagList.length} className = "artist" style = {{color:'purple'}} onClick = {that.selectTag.bind(that)}> {tag.artist} </div>)
					}
					that.forceUpdate()		
			})
		}
		else if (obj.tagFlag)
		{
			var that = obj;
			fetch("/post_tag_user", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Authorization': 'Basic',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({tag: obj.currentTag, })})
				.then(function(response) { return response.json();})
				.then(function (data) { 
					that.tagList = [] 
					that.users = data.users;
				    that.users.sort(function(a, b){
				    	if (a.username > b.username)
				        {
				        	return 1;
				        }
				        return -1;
				    });				
					for (var tag of that.users)
					{
						that.tagList.push(<div id = {that.tagList.length} className = "user" style = {{color:'purple'}} onClick = {that.selectTag.bind(that)}> {tag.username} </div>)
					}
					that.forceUpdate()		
			})
		}
		var alreadyTagFlag = false
		for (var i = 0; i < obj.potential_tags.length; ++i)
		{
			if (obj.potential_tags[i][1] == current_index)
			{
				alreadyTagFlag = true
				break;
			}
		}
		if (!alreadyTagFlag && obj.tagFlag)
		{
			var tag_label = 0;
			if (obj.artistSearch)
			{
				tag_label = 2
			}
			else if (obj.artistFlag)
			{
				tag_label = 1
			}
			obj.potential_tags.push([obj.currentTag, current_index, obj.contentRef.current.selectionEnd - 1, tag_label])
		}
	},

	tagClicked : function (obj, e)
	{
		var current_index = obj.contentRef.current.selectionEnd - 1;
		while (current_index < obj.contentRef.current.value.length)
		{
			if (obj.contentRef.current.value[current_index] == ' ' || 
				obj.contentRef.current.value[current_index] == '\t' ||
				obj.contentRef.current.value[current_index] == '\n')
			{
				--current_index
				break;
			}
			++current_index
		}
		var tag_end = current_index

		while (current_index >= 0)
		{
			if (obj.contentRef.current.value[current_index] == '@')
			{
				current_index--;
				break;
			}
			if (obj.contentRef.current.value[current_index] == '#')
			{
				current_index--;
				break;
			}
			if (obj.artistSearch && obj.contentRef.current.value[current_index] == '-')
			{
				current_index--;
				break;
			}
			current_index--;
		}

		if (obj.artistSearch)
		{
			var artist_start = current_index
			while(artist_start >= 0)
			{
				if (obj.contentRef.current.value[artist_start] == '#')
				{
					break;
				}
				artist_start--;
			}
			var artist_replaced = utils.replaceAll(e.target.textContent.substring(1, e.target.textContent.length-1), ' ', '_')
			obj.contentRef.current.value = obj.contentRef.current.value.substring(0, current_index+1) + "-" + artist_replaced + obj.contentRef.current.value.substring(tag_end+1, obj.contentRef.current.value.length)
			var tag_type = 2
			if (obj.songs_and_albums[parseInt(e.target.id)].song == "NO_SONG_ALBUM_ONLY")
			{
				tag_type = 3
			}
			obj.potential_tag = utils.replaceTag(obj.potential_tags, [obj.songs_and_albums[parseInt(e.target.id)], artist_start, current_index + artist_replaced.length + 1, tag_type]);
		}
		else if (obj.artistFlag)
		{
			var artist_replaced = utils.replaceAll(e.target.textContent.substring(1, e.target.textContent.length-1), ' ', '_')
			obj.contentRef.current.value = obj.contentRef.current.value.substring(0, current_index+1) + "#" + artist_replaced + obj.contentRef.current.value.substring(tag_end+1, obj.contentRef.current.value.length)
			obj.potential_tags = utils.replaceTag(obj.potential_tags, [obj.artists[parseInt(e.target.id)], current_index + 1, current_index + artist_replaced.length + 1, 1]);

		}
		else
		{
			var artist_replaced = utils.replaceAll(e.target.textContent.substring(1, e.target.textContent.length-1), ' ', '_')
			obj.contentRef.current.value = obj.contentRef.current.value.substring(0, current_index+1) + "@" + artist_replaced + obj.contentRef.current.value.substring(tag_end+1, obj.contentRef.current.value.length)
			obj.potential_tags = utils.replaceTag(obj.potential_tags, [obj.users[parseInt(e.target.id)], current_index + 1, current_index + artist_replaced.length + 1, 0]);

		}
		obj.contentRef.current.selectionStart = current_index + e.target.textContent.length
		obj.contentRef.current.selectionEnd = current_index + e.target.textContent.length

		obj.lastContentSize = obj.contentRef.current.value.length

		obj.contentRef.current.focus()
		obj.forceUpdate()
	},

	formatContent : function (content, raw_tags, start = [])
	{
		var content_div = start
		var tags
		var tag_indices = []
		if (raw_tags != undefined && raw_tags != null)
		{
			tags = JSON.parse(raw_tags)
			tag_indices = Object.keys(tags)
			var remaining_indices = []
			for (var index of tag_indices)
			{
				if (tags[index].length < 5)
				{
					continue
				}
				remaining_indices.push(index)
			}
			tag_indices = remaining_indices
			tag_indices.sort(
					function(a, b){
				    	if (parseInt(a) > parseInt(b))
				        {
				        	return 1;
				        }
				        return -1;
					})
				    		
		} 
		var total_index = 0;
		content.split('\n').map((item, i) => {
			var current_text = ""
			var tag_index = 0;
			var all_content = []
			var index = 0;
			while (tag_indices[0] < total_index + item.length)
			{
				var before_text = item.substring(index, tag_indices[0] - total_index)
				var current_index = tag_indices[0] - total_index;
				var tag = ""
				while (current_index < item.length)
				{
					if (item[current_index] == ' ' || 
						item[current_index] == '\t' ||
						item[current_index] == '\n')
					{
						break
					}

					tag += item[current_index]
					++current_index
				}
				current_text = ""
				index = current_index
				all_content.push(before_text)
				all_content.push(<a key = {current_index} href = {tags[tag_indices[0]][4]}>{tag}</a>)
				tag_indices.splice(0,1);
			}
			total_index += item.length + 1
			all_content.push(item.substring(index, item.length))
			//content_div.push(<p style = {{}} key={i}>{all_content}</p>);
			//content_div.push(<div style = {{minHeight:'23.67px'}} key={i}>{all_content}</div>);
			content_div.push(all_content);
			content_div.push(<br key = {i}/>)
			//content_div.push("\n");
		})
		return content_div
	}
}