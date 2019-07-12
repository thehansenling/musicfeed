module.exports =
{

	checkLoggedIn : function ()
	{
		if (document.cookie.indexOf("username=") != -1)
		{
			return true
		}
		return false
	},

	replaceAll : function(string, delimiter, replace)
	{
		var rest_string = string;
		var new_string = ""
		var current_index  = rest_string.indexOf(delimiter)
		if (current_index == -1)
		{
			return string
		}
		var substring;
		while(current_index != -1)
		{
			substring = rest_string.substring(0, current_index);
			new_string = new_string + substring + replace
			rest_string = rest_string.substring(current_index + delimiter.length)
			current_index = rest_string.indexOf(delimiter)
		}
		new_string = new_string + rest_string
		return new_string
	},

	insertTag : function(potential_tags, tag)
	{
		var remaining_tags = []
		for (var i = 0; i < potential_tags.length; ++i)
		{
			if (tag[1] == potential_tags[i][1])
			{
				continue;
			}
			remaining_tags.push(potential_tags[i])
		}
		remaining_tags.push(tag);
		return remaining_tags;
	},

	replaceTag : function(potential_tags, tag)
	{
		for (var i = 0; i < potential_tags.length; ++i)
		{
			if (tag[1] == potential_tags[i][1])
			{
				potential_tags[i] = tag;
				break
			}
		}
		return potential_tags
	},

	monthNames : ["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", "December"
	],

	renderiframe: function(iframe) {
		return {
			__html: iframe
		};
	},

	SetSpotifySize: function(iframe_string, width, height)
	{
		return iframe_string.substring(0, iframe_string.indexOf("width") + 7) + width +
		iframe_string.substring(iframe_string.indexOf("height") - 2, iframe_string.indexOf("height") + 7) +
		height + iframe_string.substring(iframe_string.indexOf("frameborder") - 2, iframe_string.length)
	},

}
