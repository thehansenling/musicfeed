module.exports = 
{
	checkLoggedIn : function ()
	{
		if (document.cookie.indexOf("username=") != -1)
		{
			console.log("TRUE")
			return true
		}
		console.log("FALSE")
		return false
	},
}
